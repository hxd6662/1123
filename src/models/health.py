from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from src.storage.database.mysql_db import Base

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    record_time = Column(DateTime, nullable=False, index=True)
    posture_score = Column(Float, nullable=True)
    fatigue_level = Column(Integer, nullable=True)
    eye_strain = Column(Integer, nullable=True)
    head_pose = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="health_records")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "record_time": self.record_time.isoformat() if self.record_time else None,
            "posture_score": self.posture_score,
            "fatigue_level": self.fatigue_level,
            "eye_strain": self.eye_strain,
            "head_pose": self.head_pose,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    message_type = Column(String(20), default="text", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="ai_conversations")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "message": self.message,
            "response": self.response,
            "message_type": self.message_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class WeeklyHealthSummary(Base):
    __tablename__ = "weekly_health_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_start_date = Column(DateTime, nullable=False, index=True)
    week_end_date = Column(DateTime, nullable=False, index=True)
    
    total_detections = Column(Integer, default=0, nullable=False)
    good_posture_count = Column(Integer, default=0, nullable=False)
    warning_posture_count = Column(Integer, default=0, nullable=False)
    bad_posture_count = Column(Integer, default=0, nullable=False)
    
    average_posture_score = Column(Float, nullable=True)
    average_head_angle = Column(Float, nullable=True)
    average_eye_distance = Column(Float, nullable=True)
    
    study_hours = Column(Float, default=0, nullable=False)
    fatigue_warnings = Column(Integer, default=0, nullable=False)
    distance_warnings = Column(Integer, default=0, nullable=False)
    
    ai_analysis = Column(Text, nullable=True)
    ai_recommendations = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="weekly_health_summaries")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "week_start_date": self.week_start_date.isoformat() if self.week_start_date else None,
            "week_end_date": self.week_end_date.isoformat() if self.week_end_date else None,
            "total_detections": self.total_detections,
            "good_posture_count": self.good_posture_count,
            "warning_posture_count": self.warning_posture_count,
            "bad_posture_count": self.bad_posture_count,
            "average_posture_score": self.average_posture_score,
            "average_head_angle": self.average_head_angle,
            "average_eye_distance": self.average_eye_distance,
            "study_hours": self.study_hours,
            "fatigue_warnings": self.fatigue_warnings,
            "distance_warnings": self.distance_warnings,
            "ai_analysis": self.ai_analysis,
            "ai_recommendations": self.ai_recommendations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
