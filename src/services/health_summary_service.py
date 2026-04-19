from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from statistics import mean

from src.models.health import HealthRecord, WeeklyHealthSummary
from src.models.user import User
from src.services.ai_service import get_deepseek_service


class HealthSummaryService:
    def __init__(self):
        self.ai_service = get_deepseek_service()

    def get_week_range(self, date: datetime) -> tuple:
        day_of_week = date.weekday()
        week_start = date - timedelta(days=day_of_week)
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        return week_start, week_end

    async def generate_weekly_summary(
        self,
        user_id: int,
        db: Session,
        target_date: Optional[datetime] = None
    ) -> WeeklyHealthSummary:
        if target_date is None:
            target_date = datetime.utcnow()

        week_start, week_end = self.get_week_range(target_date)

        existing_summary = db.query(WeeklyHealthSummary).filter(
            WeeklyHealthSummary.user_id == user_id,
            WeeklyHealthSummary.week_start_date == week_start,
            WeeklyHealthSummary.week_end_date == week_end
        ).first()

        if existing_summary:
            return existing_summary

        records = db.query(HealthRecord).filter(
            HealthRecord.user_id == user_id,
            HealthRecord.record_time >= week_start,
            HealthRecord.record_time <= week_end
        ).all()

        total_detections = len(records)
        good_posture_count = 0
        warning_posture_count = 0
        bad_posture_count = 0
        posture_scores = []
        head_angles = []
        eye_distances = []

        for record in records:
            if record.posture_score:
                posture_scores.append(record.posture_score)
                if record.posture_score >= 70:
                    good_posture_count += 1
                elif record.posture_score >= 50:
                    warning_posture_count += 1
                else:
                    bad_posture_count += 1

        average_posture_score = mean(posture_scores) if posture_scores else None
        average_head_angle = mean([r.head_angle for r in records if r.head_angle]) if any(
            r.head_angle for r in records) else None
        average_eye_distance = mean([r.eye_distance for r in records if r.eye_distance]) if any(
            r.eye_distance for r in records) else None

        study_hours = total_detections * (2 / 60) if total_detections > 0 else 0
        fatigue_warnings = sum(1 for r in records if r.fatigue_level and r.fatigue_level >= 2)
        distance_warnings = sum(1 for r in records if r.eye_strain and r.eye_strain >= 2)

        summary = WeeklyHealthSummary(
            user_id=user_id,
            week_start_date=week_start,
            week_end_date=week_end,
            total_detections=total_detections,
            good_posture_count=good_posture_count,
            warning_posture_count=warning_posture_count,
            bad_posture_count=bad_posture_count,
            average_posture_score=average_posture_score,
            average_head_angle=average_head_angle,
            average_eye_distance=average_eye_distance,
            study_hours=study_hours,
            fatigue_warnings=fatigue_warnings,
            distance_warnings=distance_warnings
        )

        db.add(summary)
        db.commit()
        db.refresh(summary)

        return summary

    async def generate_ai_analysis(
        self,
        summary: WeeklyHealthSummary,
        db: Session
    ) -> Dict[str, str]:
        data = {
            "total_detections": summary.total_detections,
            "good_posture_count": summary.good_posture_count,
            "warning_posture_count": summary.warning_posture_count,
            "bad_posture_count": summary.bad_posture_count,
            "average_posture_score": summary.average_posture_score,
            "average_head_angle": summary.average_head_angle,
            "average_eye_distance": summary.average_eye_distance,
            "study_hours": summary.study_hours,
            "fatigue_warnings": summary.fatigue_warnings,
            "distance_warnings": summary.distance_warnings,
            "week_start": summary.week_start_date.strftime("%Y-%m-%d"),
            "week_end": summary.week_end_date.strftime("%Y-%m-%d")
        }

        analysis_prompt = f"""请分析以下周度健康数据，并给出详细的分析报告：

周度数据：
- 检测总次数：{data['total_detections']}
- 良好坐姿次数：{data['good_posture_count']}
- 需注意坐姿次数：{data['warning_posture_count']}
- 需纠正坐姿次数：{data['bad_posture_count']}
- 平均坐姿分数：{data['average_posture_score']}
- 平均头部角度：{data['average_head_angle']}度
- 平均眼睛距离：{data['average_eye_distance']}厘米
- 学习时长：{data['study_hours']}小时
- 疲劳警告次数：{data['fatigue_warnings']}
- 距离警告次数：{data['distance_warnings']}
- 统计周期：{data['week_start']} 至 {data['week_end']}

请按照以下格式提供分析：

【周度总结】
简要总结本周的整体学习状态和健康状况。

【坐姿分析】
1. 分析坐姿分数的趋势
2. 指出存在的问题
3. 给出改进建议

【疲劳分析】
1. 分析疲劳状况
2. 分析用眼距离情况
3. 给出休息建议

【学习时长分析】
1. 评估本周学习时长是否合理
2. 给出学习节奏建议

【总体评价】
用1-2句话总结本周表现。"""

        recommendations_prompt = f"""基于以下周度健康数据，给出具体、可执行的改进建议：

周度数据：
- 检测总次数：{data['total_detections']}
- 良好坐姿次数：{data['good_posture_count']}
- 需注意坐姿次数：{data['warning_posture_count']}
- 需纠正坐姿次数：{data['bad_posture_count']}
- 平均坐姿分数：{data['average_posture_score']}
- 平均头部角度：{data['average_head_angle']}度
- 平均眼睛距离：{data['average_eye_distance']}厘米
- 学习时长：{data['study_hours']}小时
- 疲劳警告次数：{data['fatigue_warnings']}
- 距离警告次数：{data['distance_warnings']}

请给出5条具体的、可执行的改进建议，每条建议100字以内，格式如下：

1. 【建议标题】
具体建议内容...

2. 【建议标题】
具体建议内容...

以此类推，共5条建议。"""

        try:
            analysis_result = self.ai_service.chat(analysis_prompt, [])
            recommendations_result = self.ai_service.chat(recommendations_prompt, [])

            summary.ai_analysis = analysis_result
            summary.ai_recommendations = recommendations_result
            db.commit()

            return {
                "analysis": analysis_result,
                "recommendations": recommendations_result
            }
        except Exception as e:
            return {
                "analysis": f"AI分析生成失败：{str(e)}",
                "recommendations": "建议保持良好的学习习惯，每学习30分钟休息5分钟。"
            }

    async def get_weekly_summary(
        self,
        user_id: int,
        db: Session,
        target_date: Optional[datetime] = None
    ) -> WeeklyHealthSummary:
        summary = await self.generate_weekly_summary(user_id, db, target_date)

        if not summary.ai_analysis:
            await self.generate_ai_analysis(summary, db)

        return summary

    async def get_all_weekly_summaries(
        self,
        user_id: int,
        db: Session,
        limit: int = 10
    ) -> list:
        summaries = db.query(WeeklyHealthSummary).filter(
            WeeklyHealthSummary.user_id == user_id
        ).order_by(WeeklyHealthSummary.week_start_date.desc()).limit(limit).all()

        return summaries


_health_summary_service = None


def get_health_summary_service() -> HealthSummaryService:
    global _health_summary_service
    if _health_summary_service is None:
        _health_summary_service = HealthSummaryService()
    return _health_summary_service
