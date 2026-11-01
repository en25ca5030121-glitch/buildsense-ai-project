import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB
os.environ["DATABASE_URL"] = "sqlite:///./test_buildsense.db"

from app.main import app
from app.database.session import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_buildsense.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    from app.database.seed import seed_initial_data
    db = TestingSessionLocal()
    seed_initial_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_buildsense.db"):
        try:
            os.remove("./test_buildsense.db")
        except Exception:
            pass

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "BuildSense AI" in data["service"]

def test_demo_login(client):
    response = client.post("/api/auth/demo-login", json={"role": "Administrator"})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["user"]["role"] == "Administrator"
    assert "access_token" in res_json["data"]

def test_user_registration_and_login(client):
    reg_payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "full_name": "Test Inspector",
        "role": "Site Engineer"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200
    token = reg_resp.json()["data"]["access_token"]
    assert token is not None

    # Login
    login_resp = client.post("/api/auth/login", json={"email": "testuser@example.com", "password": "Password123!"})
    assert login_resp.status_code == 200
    assert login_resp.json()["data"]["user"]["email"] == "testuser@example.com"

def test_projects_crud(client):
    # Demo login for token
    auth_resp = client.post("/api/auth/demo-login", json={"role": "Project Manager"})
    token = auth_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List projects
    list_resp = client.get("/api/projects")
    assert list_resp.status_code == 200
    projects = list_resp.json()["data"]
    assert len(projects) >= 1

    # 2. Create project
    create_payload = {
        "name": "Midtown Health Clinic",
        "project_type": "Commercial",
        "location": "Midtown Manhattan, NY",
        "budget": 12500000.0,
        "spent_budget": 1200000.0,
        "start_date": "2026-02-01",
        "end_date": "2027-04-30",
        "status": "In Progress",
        "completion_percentage": 10,
        "client_name": "Midtown Health Network",
        "notes": "State-of-the-art ambulatory surgical center."
    }
    c_resp = client.post("/api/projects", json=create_payload, headers=headers)
    assert c_resp.status_code == 200
    new_proj = c_resp.json()["data"]
    p_id = new_proj["id"]
    assert new_proj["name"] == "Midtown Health Clinic"

    # 3. Get project detail
    g_resp = client.get(f"/api/projects/{p_id}")
    assert g_resp.status_code == 200
    assert g_resp.json()["data"]["id"] == p_id

    # 4. Update project
    u_resp = client.put(f"/api/projects/{p_id}", json={"completion_percentage": 15}, headers=headers)
    assert u_resp.status_code == 200
    assert u_resp.json()["data"]["completion_percentage"] == 15

    # 5. Delete project
    d_resp = client.delete(f"/api/projects/{p_id}", headers=headers)
    assert d_resp.status_code == 200

def test_safety_analysis_demo_mode(client):
    resp = client.post("/api/analysis/safety", data={"categories": "PPE,Fall Hazards"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["mode"] == "demo"
    assert "findings" in data["data"]
    assert len(data["data"]["findings"]) > 0
    assert "PRELIMINARY AI OBSERVATION" in data["data"]["disclaimer"]

def test_crack_analysis_demo_mode(client):
    resp = client.post("/api/analysis/cracks", data={"structure_type": "Foundation Wall", "location_notes": "Grid B-2"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["mode"] == "demo"
    assert "observations" in data["data"]
    assert len(data["data"]["observations"]) > 0
    assert "NON-STRUCTURAL VISUAL ESTIMATE" in data["data"]["disclaimer"]

def test_property_valuation(client):
    val_payload = {
        "property_type": "Commercial Complex",
        "location": "Dallas, TX",
        "land_area": 8000.0,
        "builtup_area": 25000.0,
        "floors": 3,
        "rooms": 20,
        "age": 2,
        "quality": "Standard",
        "condition": "Good",
        "amenities": ["HVAC", "Sprinkler System", "Elevator"]
    }
    resp = client.post("/api/valuation", json=val_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["estimated_avg"] > 0
    assert data["data"]["price_per_sq_unit"] > 0
    assert "ILLUSTRATIVE ESTIMATION ONLY" in data["data"]["disclaimer"]

def test_planning_generation(client):
    plan_payload = {
        "project_name": "Riverside Office Pavilion",
        "scope": "New 3-story steel framing office building",
        "project_type": "Commercial",
        "site_area": 12000.0,
        "start_date": "2026-03-01",
        "target_completion_date": "2027-06-30",
        "budget": 9500000.0,
        "team_size": 30,
        "complexity": "Medium"
    }
    resp = client.post("/api/planning/generate", json=plan_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]["wbs"]) > 0
    assert len(data["data"]["milestones"]) > 0
    assert len(data["data"]["risks"]) > 0

def test_weather_advisory(client):
    resp = client.get("/api/weather?location=Chicago, IL")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "advisories" in data["data"]
    assert "forecast" in data["data"]
    assert len(data["data"]["advisories"]) > 0

def test_assistant_chat(client):
    chat_payload = {
        "message": "What are key precautions for concrete curing in hot weather?",
        "session_id": "test-session-123"
    }
    resp = client.post("/api/assistant/chat", json=chat_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]["content"]) > 20
    assert "disclaimer" in data["data"]

def test_daily_site_reports(client):
    # Get project id
    p_resp = client.get("/api/projects")
    projects = p_resp.json()["data"]
    p_id = projects[0]["id"]

    daily_payload = {
        "project_id": p_id,
        "report_date": "2026-11-01",
        "work_completed": "Excavation and subbase compaction completed for Sector 3.",
        "workers_count": 45,
        "equipment_used": "CAT Excavator 320, Roller Compactor",
        "materials_consumed": "60 tons aggregate base coarse",
        "deliveries": "2 loads crushed stone",
        "weather_notes": "Sunny, 22°C",
        "safety_incidents": "None reported",
        "delays": "None",
        "next_day_plan": "Install geogrid stabilization layer and vapor barrier.",
        "supervisor_name": "David Chen, PE"
    }
    c_resp = client.post("/api/reports/daily", json=daily_payload)
    assert c_resp.status_code == 200
    rep_id = c_resp.json()["data"]["id"]

    # Retrieve detail
    g_resp = client.get(f"/api/reports/daily/{rep_id}")
    assert g_resp.status_code == 200
    assert g_resp.json()["data"]["workers_count"] == 45

def test_analytics_dashboard(client):
    resp = client.get("/api/analytics/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "metrics" in data["data"]
    assert "project_progress" in data["data"]
    assert "weekly_activity" in data["data"]

def test_unauthorized_access(client):
    # Attempting to delete a project without token
    resp = client.delete("/api/projects/999")
    assert resp.status_code == 401
