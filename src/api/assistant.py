from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid
import json

from src.storage.database.mysql_db import get_session
from src.models.health import AIConversation
from src.models.user import User
from src.api.auth import get_current_user
from src.services import get_deepseek_service
from src.services.animation_service import get_animation_service

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

@router.get("/history")
def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    query = db.query(AIConversation).filter(AIConversation.user_id == current_user.id)
    if session_id:
        query = query.filter(AIConversation.session_id == session_id)
    
    conversations = query.order_by(AIConversation.created_at.desc()).limit(limit).all()
    return {"success": True, "data": [c.to_dict() for c in reversed(conversations)]}

@router.post("/chat")
def chat_with_assistant(
    chat: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    session_id = chat.session_id or str(uuid.uuid4())
    
    ai_service = get_deepseek_service()
    
    conversation_history = []
    if session_id:
        previous_conversations = db.query(AIConversation).filter(
            AIConversation.user_id == current_user.id,
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at).all()
        
        for conv in previous_conversations:
            conversation_history.append({"role": "user", "content": conv.message})
            conversation_history.append({"role": "assistant", "content": conv.response})
    
    ai_response = ai_service.chat(chat.message, conversation_history)
    
    new_conversation = AIConversation(
        user_id=current_user.id,
        session_id=session_id,
        message=chat.message,
        response=ai_response,
        message_type="text"
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


@router.post("/chat-with-suggestions")
def chat_with_assistant_and_suggestions(
    chat: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    session_id = chat.session_id or str(uuid.uuid4())
    
    ai_service = get_deepseek_service()
    
    conversation_history = []
    if session_id:
        previous_conversations = db.query(AIConversation).filter(
            AIConversation.user_id == current_user.id,
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at).all()
        
        for conv in previous_conversations:
            conversation_history.append({"role": "user", "content": conv.message})
            conversation_history.append({"role": "assistant", "content": conv.response})
    
    ai_response = ai_service.chat(chat.message, conversation_history)
    
    new_conversation = AIConversation(
        user_id=current_user.id,
        session_id=session_id,
        message=chat.message,
        response=ai_response,
        message_type="text"
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    suggestions_prompt = f"""基于我们刚才的对话：
用户问：{chat.message}
我回答：{ai_response}

请给出3个相关的后续问题推荐，帮助用户继续深入学习。
请只返回JSON数组格式，不要有其他文字，例如：
["问题1", "问题2", "问题3"]"""
    
    try:
        suggestions_response = ai_service.chat(suggestions_prompt, [])
        import json
        suggestions = json.loads(suggestions_response)
        if not isinstance(suggestions, list):
            suggestions = []
    except:
        suggestions = []
    
    return {
        "success": True,
        "data": {
            "message": ai_response,
            "session_id": session_id,
            "conversation_id": new_conversation.id,
            "suggestions": suggestions[:3]
        }
    }

@router.post("/chat/stream")
def chat_with_assistant_stream(
    chat: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    session_id = chat.session_id or str(uuid.uuid4())
    
    ai_service = get_deepseek_service()
    
    conversation_history = []
    if session_id:
        previous_conversations = db.query(AIConversation).filter(
            AIConversation.user_id == current_user.id,
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at).all()
        
        for conv in previous_conversations:
            conversation_history.append({"role": "user", "content": conv.message})
            conversation_history.append({"role": "assistant", "content": conv.response})
    
    full_response = []
    
    def generate():
        nonlocal full_response
        for chunk in ai_service.chat_stream(chat.message, conversation_history):
            full_response.append(chunk)
            yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
        
        complete_message = ''.join(full_response)
        
        new_conversation = AIConversation(
            user_id=current_user.id,
            session_id=session_id,
            message=chat.message,
            response=complete_message,
            message_type="text"
        )
        db.add(new_conversation)
        db.commit()
        
        yield f"data: {json.dumps({'done': True, 'session_id': session_id}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/sessions")
def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    sessions = db.query(
        AIConversation.session_id,
        db.func.max(AIConversation.created_at).label('last_message_time'),
        db.func.count(AIConversation.id).label('message_count')
    ).filter(
        AIConversation.user_id == current_user.id,
        AIConversation.session_id.isnot(None)
    ).group_by(
        AIConversation.session_id
    ).order_by(
        db.func.max(AIConversation.created_at).desc()
    ).all()
    
    session_list = []
    for session in sessions:
        session_list.append({
            "session_id": session.session_id,
            "last_message_time": session.last_message_time.isoformat() if session.last_message_time else None,
            "message_count": session.message_count
        })
    
    return {"success": True, "data": session_list}


# -----------------------------------------------------------------------
# 动画生成相关 API
# -----------------------------------------------------------------------
class AnimationRequest(BaseModel):
    topic: str
    history: Optional[list] = None


@router.post("/animation/generate")
async def generate_animation(
    request: AnimationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    生成动画（非流式）
    """
    animation_service = get_animation_service()
    if not animation_service.is_available():
        raise HTTPException(status_code=500, detail="Animation service is not available")
    
    result = await animation_service.generate_animation(request.topic, request.history)
    return {"success": True, "data": {"html": result}}


@router.post("/animation/generate/stream")
async def generate_animation_stream(
    request: AnimationRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    生成动画（流式）
    """
    animation_service = get_animation_service()
    if not animation_service.is_available():
        raise HTTPException(status_code=500, detail="Animation service is not available")
    
    accumulated_response = []
    
    async def event_generator():
        nonlocal accumulated_response
        try:
            async for chunk in animation_service.generate_animation_stream(request.topic, request.history):
                accumulated_response.append(chunk)
                if await http_request.is_disconnected():
                    break
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    headers = {
        "Cache-Control": "no-store",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_generator(), headers=headers)
