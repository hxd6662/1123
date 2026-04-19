from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from src.storage.database.mysql_db import get_session
from src.models.learning import LearningStat, LearningGoal
from src.models.user import User
from src.api.auth import get_current_user
from src.services import get_deepseek_service

router = APIRouter()

class LearningStatCreate(BaseModel):
    study_minutes: int
    questions_attempted: int = 0
    questions_correct: int = 0

class LearningGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[date] = None

class LearningGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    is_completed: Optional[bool] = None
    progress: Optional[int] = None

@router.get("/stats/{user_id}")
async def get_learning_stats(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(LearningStat).filter(LearningStat.user_id == user_id)
    if start_date:
        query = query.filter(LearningStat.study_date >= start_date)
    if end_date:
        query = query.filter(LearningStat.study_date <= end_date)
    
    stats = query.order_by(LearningStat.study_date.desc()).all()
    
    total_minutes = sum(s.study_minutes for s in stats)
    total_questions = sum(s.questions_attempted for s in stats)
    total_correct = sum(s.questions_correct for s in stats)
    
    first_date = db.query(func.min(LearningStat.study_date)).filter(
        LearningStat.user_id == user_id
    ).scalar()
    
    consecutive_days = 0
    if first_date:
        today = date.today()
        current_date = today
        while True:
            stat = db.query(LearningStat).filter(
                and_(
                    LearningStat.user_id == user_id,
                    LearningStat.study_date == current_date
                )
            ).first()
            if stat:
                consecutive_days += 1
                current_date = current_date.replace(day=current_date.day - 1)
            else:
                break
    
    return {
        "success": True,
        "data": {
            "stats": [s.to_dict() for s in stats],
            "totalStudyMinutes": total_minutes,
            "totalQuestions": total_questions,
            "consecutiveDays": consecutive_days,
            "accuracy": round(total_correct / total_questions * 100, 1) if total_questions > 0 else 0
        }
    }

@router.post("/stats")
async def create_learning_stat(
    stat: LearningStatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    today = date.today()
    existing_stat = db.query(LearningStat).filter(
        and_(
            LearningStat.user_id == current_user.id,
            LearningStat.study_date == today
        )
    ).first()
    
    if existing_stat:
        existing_stat.study_minutes += stat.study_minutes
        existing_stat.questions_attempted += stat.questions_attempted
        existing_stat.questions_correct += stat.questions_correct
    else:
        new_stat = LearningStat(
            user_id=current_user.id,
            study_date=today,
            study_minutes=stat.study_minutes,
            questions_attempted=stat.questions_attempted,
            questions_correct=stat.questions_correct
        )
        db.add(new_stat)
    
    db.commit()
    return {"success": True, "message": "Learning stat recorded"}

@router.get("/goals")
async def get_learning_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    goals = db.query(LearningGoal).filter(
        LearningGoal.user_id == current_user.id
    ).order_by(LearningGoal.created_at.desc()).all()
    return {"success": True, "data": [g.to_dict() for g in goals]}

@router.post("/goals")
async def create_learning_goal(
    goal: LearningGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    new_goal = LearningGoal(
        user_id=current_user.id,
        title=goal.title,
        description=goal.description,
        target_date=goal.target_date
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return {"success": True, "data": new_goal.to_dict()}

@router.put("/goals/{goal_id}")
async def update_learning_goal(
    goal_id: int,
    goal_update: LearningGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    goal = db.query(LearningGoal).filter(
        and_(LearningGoal.id == goal_id, LearningGoal.user_id == current_user.id)
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    return {"success": True, "data": goal.to_dict()}

@router.delete("/goals/{goal_id}")
async def delete_learning_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    goal = db.query(LearningGoal).filter(
        and_(LearningGoal.id == goal_id, LearningGoal.user_id == current_user.id)
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"success": True, "message": "Goal deleted"}

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_session)
):
    current_user_id = 1
    today = date.today()
    
    today_stat = db.query(LearningStat).filter(
        and_(
            LearningStat.user_id == current_user_id,
            LearningStat.study_date == today
        )
    ).first()
    
    study_time = today_stat.study_minutes if today_stat else 0
    completed_questions = today_stat.questions_correct if today_stat else 0
    
    first_date = db.query(func.min(LearningStat.study_date)).filter(
        LearningStat.user_id == current_user_id
    ).scalar()
    
    streak_days = 0
    if first_date:
        current_date = today
        while True:
            stat = db.query(LearningStat).filter(
                and_(
                    LearningStat.user_id == current_user_id,
                    LearningStat.study_date == current_date
                )
            ).first()
            if stat:
                streak_days += 1
                current_date = current_date.replace(day=current_date.day - 1)
            else:
                break
    
    from src.models.question import WrongQuestion
    wrong_count = db.query(func.count(WrongQuestion.id)).filter(
        WrongQuestion.user_id == current_user_id
    ).scalar() or 0
    
    goal_count = db.query(func.count(LearningGoal.id)).filter(
        LearningGoal.user_id == current_user_id
    ).scalar() or 0
    
    return {
        "success": True,
        "study_time": study_time,
        "completed_questions": completed_questions,
        "streak_days": streak_days,
        "wrong_questions": wrong_count,
        "goals": goal_count
    }


class GoalPlanRequest(BaseModel):
    goal_title: str
    goal_description: Optional[str] = None


@router.post("/goals/plan")
async def plan_learning_goal(
    request: GoalPlanRequest,
    current_user: User = Depends(get_current_user)
):
    """
    基于学习目标标题，由AI帮忙规划学习目标
    """
    ai_service = get_deepseek_service()
    
    prompt = f"""请帮助用户规划一个学习目标。

目标标题：{request.goal_title}
{request.goal_description and f'目标描述：{request.goal_description}' or ''}

请为这个学习目标提供一个清晰、可执行的规划建议，包括：
1. 目标的合理分解（将大目标拆解成小步骤）
2. 建议的完成时间安排
3. 关键的注意事项和学习方法
4. 如何检查和衡量学习效果

请用简洁、友好、实用的语言回答，适合中小学生使用。
格式使用Markdown，便于阅读。"""
    
    ai_response = ai_service.chat(prompt)
    
    return {
        "success": True,
        "data": {
            "plan": ai_response
        }
    }


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_session)
):
    """返回模拟数据，与首页保持一致"""
    return {
        "success": True,
        "data": {
            "totalStudyMinutes": 120,
            "totalQuestions": 12,
            "consecutiveDays": 7,
            "accuracy": 85
        }
    }


@router.post("/report/generate")
async def generate_learning_report(
    current_user: User = Depends(get_current_user)
):
    """
    生成学情报告
    """
    ai_service = get_deepseek_service()
    
    # 模拟学习数据
    stats_data = {
        "total_study_time": "2小时",
        "completed_questions": 12,
        "accuracy_rate": "85%",
        "consecutive_days": 7,
        "weak_subjects": ["数学几何", "英语语法"],
        "strong_subjects": ["语文阅读", "物理基础"]
    }
    
    prompt = f"""请为学生生成一份详细的学情分析报告。

学习数据概况：
- 总学习时长：{stats_data['total_study_time']}
- 完成题目数：{stats_data['completed_questions']}
- 正确率：{stats_data['accuracy_rate']}
- 连续学习天数：{stats_data['consecutive_days']}

优势学科：{', '.join(stats_data['strong_subjects'])}
需要加强的学科：{', '.join(stats_data['weak_subjects'])}

请生成一份结构清晰、内容详实的学情报告，包含以下部分：
1. 学习概况总结
2. 优势分析
3. 不足与改进建议
4. 具体学习计划
5. 鼓励与期望

请用Markdown格式输出，语言要积极、鼓励性，适合中小学生阅读。"""
    
    ai_response = ai_service.chat(prompt)
    
    return {
        "success": True,
        "data": {
            "report": ai_response,
            "generated_at": datetime.now().isoformat()
        }
    }
