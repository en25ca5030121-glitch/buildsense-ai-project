from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import ChatMessage, Project
from app.schemas import AssistantChatRequest, AssistantChatResponse, APIEnvelope
from app.services.ai_service import AIService

router = APIRouter(prefix="/assistant", tags=["AI Construction Assistant"])

@router.post("/chat", response_model=APIEnvelope[AssistantChatResponse])
async def chat_with_assistant(
    req: AssistantChatRequest,
    db: Session = Depends(get_db)
):
    project_context = ""
    if req.project_id:
        proj = db.query(Project).filter(Project.id == req.project_id).first()
        if proj:
            project_context = f"Project '{proj.name}', Type: {proj.project_type}, Location: {proj.location}, Status: {proj.status}, Budget: ${proj.budget:,.2f}"

    # Record user message in DB
    user_msg = ChatMessage(
        session_id=req.session_id,
        project_id=req.project_id,
        role="user",
        content=req.message,
        mode="user"
    )
    db.add(user_msg)
    db.commit()

    try:
        reply_data, mode = await AIService.chat_assistant(req.message, project_context)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Assistant query failed: {str(e)}"
        )

    # Record assistant reply in DB
    bot_msg = ChatMessage(
        session_id=req.session_id,
        project_id=req.project_id,
        role="assistant",
        content=reply_data.content,
        mode=mode
    )
    db.add(bot_msg)
    db.commit()

    return APIEnvelope(success=True, mode=mode, data=reply_data)

@router.get("/history/{session_id}", response_model=APIEnvelope[List[dict]])
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    history = [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "mode": m.mode,
            "created_at": m.created_at.isoformat()
        }
        for m in msgs
    ]
    return APIEnvelope(success=True, mode="db", data=history)

@router.delete("/history/{session_id}", response_model=APIEnvelope[dict])
def clear_chat_history(session_id: str, db: Session = Depends(get_db)):
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.commit()
    return APIEnvelope(success=True, mode="db", data={"message": "Chat conversation cleared"})
