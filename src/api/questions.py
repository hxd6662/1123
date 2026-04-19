from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from src.storage.database.mysql_db import get_session
from src.models.question import WrongQuestion, LearningResource
from src.models.user import User
from src.api.auth import get_current_user
from src.services.ai_service import get_photo_search_service

router = APIRouter()

class WrongQuestionCreate(BaseModel):
    question_text: str
    question_image: Optional[str] = None
    correct_answer: Optional[str] = None
    user_answer: Optional[str] = None
    knowledge_point: Optional[str] = None
    subject: Optional[str] = None
    difficulty: str = "medium"
    analysis: Optional[str] = None
    tags: Optional[List[str]] = None

class WrongQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    correct_answer: Optional[str] = None
    user_answer: Optional[str] = None
    knowledge_point: Optional[str] = None
    subject: Optional[str] = None
    difficulty: Optional[str] = None
    analysis: Optional[str] = None
    tags: Optional[List[str]] = None
    is_mastered: Optional[bool] = None

class AISolveRequest(BaseModel):
    question: str
    subject: Optional[str] = None

@router.get("/wrong")
def get_wrong_questions(
    subject: Optional[str] = None,
    knowledge_point: Optional[str] = None,
    is_mastered: Optional[bool] = None,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    query = db.query(WrongQuestion).filter(WrongQuestion.user_id == current_user.id)
    
    if subject:
        query = query.filter(WrongQuestion.subject == subject)
    if knowledge_point:
        query = query.filter(WrongQuestion.knowledge_point == knowledge_point)
    if is_mastered is not None:
        query = query.filter(WrongQuestion.is_mastered == (1 if is_mastered else 0))
    
    total = query.count()
    questions = query.order_by(WrongQuestion.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "questions": [q.to_dict() for q in questions],
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@router.get("/wrong/{question_id}")
def get_wrong_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    question = db.query(WrongQuestion).filter(
        and_(WrongQuestion.id == question_id, WrongQuestion.user_id == current_user.id)
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"success": True, "data": question.to_dict()}

@router.post("/wrong")
def create_wrong_question(
    question: WrongQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    # 防止重复收录：检查是否已存在相同题目
    existing_question = db.query(WrongQuestion).filter(
        and_(
            WrongQuestion.user_id == current_user.id,
            WrongQuestion.question_text == question.question_text
        )
    ).first()
    
    if existing_question:
        # 如果存在，可以更新或者直接返回
        return {"success": True, "data": existing_question.to_dict(), "message": "该题目已在错题本中"}

    new_question = WrongQuestion(
        user_id=current_user.id,
        question_text=question.question_text,
        question_image=question.question_image,
        correct_answer=question.correct_answer,
        user_answer=question.user_answer,
        knowledge_point=question.knowledge_point,
        subject=question.subject,
        difficulty=question.difficulty,
        analysis=question.analysis,
        tags=question.tags
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return {"success": True, "data": new_question.to_dict()}

@router.put("/wrong/{question_id}")
def update_wrong_question(
    question_id: int,
    question_update: WrongQuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    question = db.query(WrongQuestion).filter(
        and_(WrongQuestion.id == question_id, WrongQuestion.user_id == current_user.id)
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "is_mastered":
            setattr(question, field, 1 if value else 0)
        else:
            setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    return {"success": True, "data": question.to_dict()}

@router.post("/wrong/{question_id}/review")
def review_wrong_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    question = db.query(WrongQuestion).filter(
        and_(WrongQuestion.id == question_id, WrongQuestion.user_id == current_user.id)
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question.review_count += 1
    question.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(question)
    return {"success": True, "data": question.to_dict()}

@router.delete("/wrong/{question_id}")
def delete_wrong_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    question = db.query(WrongQuestion).filter(
        and_(WrongQuestion.id == question_id, WrongQuestion.user_id == current_user.id)
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(question)
    db.commit()
    return {"success": True, "message": "Question deleted"}

@router.get("/resources")
def get_learning_resources(
    subject: Optional[str] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_session)
):
    query = db.query(LearningResource)
    
    if subject:
        query = query.filter(LearningResource.subject == subject)
    if resource_type:
        query = query.filter(LearningResource.resource_type == resource_type)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)
    if search:
        query = query.filter(
            or_(
                LearningResource.title.contains(search),
                LearningResource.description.contains(search)
            )
        )
    
    total = query.count()
    resources = query.order_by(LearningResource.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "resources": [r.to_dict() for r in resources],
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@router.post("/ai-solve")
def ai_solve_question(
    request: AISolveRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI解题功能
    """
    ai_service = get_photo_search_service()
    
    try:
        # 构建提示词
        prompt = request.question
        if request.subject:
            prompt = f"科目：{request.subject}\n\n题目：{prompt}"
        
        # 完整的提示词，明确要求Markdown格式
        full_prompt = f"""请分析以下题目，给出详细的讲解和思路引导。

{prompt}

【重要】请严格按照以下要求输出：
1. 必须使用标准的Markdown格式
2. 所有数学公式必须使用LaTeX语法，用$包裹行内公式，用$$包裹块级公式
3. 包含以下五个部分，不要省略：

## 思路
分步骤引导学生思考题目的解题方向，说明每一步的目的。

## 步骤
给出完整、详细的解题过程，包括计算、推理等。

## 公式
单独列出本题中涉及的核心数学、物理或化学公式。

## 答案
明确给出最终答案。

## 易错点
总结本题涉及的易错点和注意事项。"""
        
        # 调用AI服务解题
        solution = ai_service.chat(full_prompt)
        
        # 尝试从AI回复中提取最终答案
        correct_answer = None
        import re
        # 查找## 答案 或类似标记
        answer_match = re.search(r'##\s*答案[:：]?\s*(.*?)(?=\n##|$)', solution, re.DOTALL)
        if not answer_match:
            answer_match = re.search(r'【答案】[:：]?\s*(.*?)(?=\n|【|$)', solution)
        if answer_match:
            correct_answer = answer_match.group(1).strip()
        
        return {
            "success": True,
            "data": {
                "solution": solution,
                "correct_answer": correct_answer
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI解题失败: {str(e)}")
