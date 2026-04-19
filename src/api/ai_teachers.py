from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid

from src.storage.database.mysql_db import get_session
from src.models.health import AIConversation
from src.models.user import User
from src.api.auth import get_current_user
from src.services.ai_service import (
    get_chinese_service,
    get_math_service,
    get_english_service,
    get_physics_service,
    get_chemistry_service,
    get_biology_service,
    get_geography_service,
    get_history_service,
    get_politics_service
)

router = APIRouter()

class TeacherChatMessage(BaseModel):
    message: str
    subject: str
    session_id: Optional[str] = None

SUBJECT_SERVICE_MAP = {
    "chinese": {
        "name": "语文老师",
        "service": get_chinese_service
    },
    "math": {
        "name": "数学老师",
        "service": get_math_service
    },
    "english": {
        "name": "英语老师",
        "service": get_english_service
    },
    "physics": {
        "name": "物理老师",
        "service": get_physics_service
    },
    "chemistry": {
        "name": "化学老师",
        "service": get_chemistry_service
    },
    "biology": {
        "name": "生物老师",
        "service": get_biology_service
    },
    "geography": {
        "name": "地理老师",
        "service": get_geography_service
    },
    "history": {
        "name": "历史老师",
        "service": get_history_service
    },
    "politics": {
        "name": "政治老师",
        "service": get_politics_service
    }
}

@router.get("/teachers")
def get_ai_teachers():
    teachers = []
    for key, config in SUBJECT_SERVICE_MAP.items():
        teachers.append({
            "id": key,
            "name": config["name"],
            "avatar": get_teacher_avatar(key)
        })
    return {"success": True, "data": teachers}

def get_teacher_avatar(subject):
    avatars = {
        "chinese": "📚",
        "math": "🔢",
        "english": "🌍",
        "physics": "⚡",
        "chemistry": "🧪",
        "biology": "🌱",
        "geography": "🗺️",
        "history": "📜",
        "politics": "⚖️"
    }
    return avatars.get(subject, "👨‍🏫")

@router.get("/teachers/{subject}")
def get_teacher_info(subject: str):
    if subject not in SUBJECT_SERVICE_MAP:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    config = SUBJECT_SERVICE_MAP[subject]
    return {
        "success": True,
        "data": {
            "id": subject,
            "name": config["name"],
            "avatar": get_teacher_avatar(subject)
        }
    }

@router.post("/teachers/{subject}/chat")
def chat_with_teacher(
    subject: str,
    chat: TeacherChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    if subject not in SUBJECT_SERVICE_MAP:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    config = SUBJECT_SERVICE_MAP[subject]
    session_id = chat.session_id or str(uuid.uuid4())
    
    try:
        ai_service = config["service"]()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize AI service: {str(e)}")
    
    conversation_history = []
    if session_id:
        previous_conversations = db.query(AIConversation).filter(
            AIConversation.user_id == current_user.id,
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at).all()
        
        for conv in previous_conversations:
            conversation_history.append({"role": "user", "content": conv.message})
            conversation_history.append({"role": "assistant", "content": conv.response})
    
    try:
        ai_response = ai_service.chat(chat.message, conversation_history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")
    
    new_conversation = AIConversation(
        user_id=current_user.id,
        session_id=session_id,
        message=chat.message,
        response=ai_response,
        message_type=f"teacher_{subject}"
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    return {
        "success": True,
        "data": {
            "message": ai_response,
            "session_id": session_id,
            "conversation_id": new_conversation.id
        }
    }

@router.get("/teachers/{subject}/history")
def get_teacher_chat_history(
    subject: str,
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    query = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id,
        AIConversation.message_type == f"teacher_{subject}"
    )
    
    if session_id:
        query = query.filter(AIConversation.session_id == session_id)
    
    conversations = query.order_by(AIConversation.created_at.desc()).limit(limit).all()
    return {"success": True, "data": [c.to_dict() for c in reversed(conversations)]}
