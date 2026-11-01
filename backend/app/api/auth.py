from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User
from app.schemas import (
    UserCreate, UserLogin, DemoLoginRequest, UserResponse, TokenResponse, APIEnvelope
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEMO_ROLES = {
    "Administrator": {
        "email": "admin@buildsense.ai",
        "full_name": "Marcus Vance (Director of Construction)",
        "role": "Administrator"
    },
    "Project Manager": {
        "email": "pm@buildsense.ai",
        "full_name": "Sarah Jenkins, PMP",
        "role": "Project Manager"
    },
    "Site Engineer": {
        "email": "engineer@buildsense.ai",
        "full_name": "David Chen, PE",
        "role": "Site Engineer"
    },
    "Safety Officer": {
        "email": "safety@buildsense.ai",
        "full_name": "Elena Rodriguez, CSP",
        "role": "Safety Officer"
    }
}

@router.post("/register", response_model=APIEnvelope[TokenResponse])
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "Site Engineer",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return APIEnvelope(
        success=True,
        mode="auth",
        data=TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    )

@router.post("/login", response_model=APIEnvelope[TokenResponse])
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact platform administrator."
        )
    
    token = create_access_token(user.id)
    return APIEnvelope(
        success=True,
        mode="auth",
        data=TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    )

@router.post("/demo-login", response_model=APIEnvelope[TokenResponse])
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    role_key = req.role if req.role in DEMO_ROLES else "Administrator"
    profile = DEMO_ROLES[role_key]
    
    user = db.query(User).filter(User.email == profile["email"]).first()
    if not user:
        user = User(
            email=profile["email"],
            hashed_password=hash_password("DemoPassword123!"),
            full_name=profile["full_name"],
            role=profile["role"],
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    token = create_access_token(user.id)
    return APIEnvelope(
        success=True,
        mode="demo",
        data=TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    )

@router.get("/me", response_model=APIEnvelope[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return APIEnvelope(
        success=True,
        mode="auth",
        data=UserResponse.model_validate(current_user)
    )
