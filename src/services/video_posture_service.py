import time
import random
from typing import Dict, Any
from datetime import datetime
from collections import deque
import statistics


class RealTimePostureSession:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.is_active = False
        self.start_time = None
        self.end_time = None
        self.detection_results = deque(maxlen=100)
        self.total_frames = 0
        self.good_posture_frames = 0
        self.bad_posture_frames = 0
        self.warning_count = 0
        self.last_detection_time = 0
        self.detection_interval = 1.0
        
    def add_detection_result(self, result: Dict[str, Any]):
        self.detection_results.append({
            "time": datetime.utcnow().isoformat(),
            "score": result.get("score", 0),
            "status": result.get("status", "unknown"),
            "head_angle": result.get("head_angle", 0),
            "eye_distance": result.get("eye_distance", 45),
            "message": result.get("message", ""),
            "details": result.get("details", {})
        })
        
        self.total_frames += 1
        status = result.get("status")
        if status == "good":
            self.good_posture_frames += 1
        elif status in ["warning", "danger"]:
            self.bad_posture_frames += 1
            self.warning_count += 1
    
    def get_statistics(self) -> Dict[str, Any]:
        if not self.detection_results:
            return {
                "detection_count": 0,
                "good_posture_rate": 0,
                "bad_posture_count": 0,
                "warning_count": 0,
                "average_score": 0,
                "session_duration": 0
            }
        
        scores = [r["score"] for r in self.detection_results]
        avg_score = statistics.mean(scores) if scores else 0
        
        good_rate = (self.good_posture_frames / self.total_frames * 100) if self.total_frames > 0 else 0
        
        duration = 0
        if self.start_time:
            end = self.end_time or datetime.utcnow()
            duration = (end - self.start_time).total_seconds()
        
        return {
            "detection_count": self.total_frames,
            "good_posture_rate": round(good_rate, 1),
            "bad_posture_count": self.bad_posture_frames,
            "warning_count": self.warning_count,
            "average_score": round(avg_score, 1),
            "session_duration": int(duration)
        }


class VideoStreamPostureService:
    def __init__(self):
        self.sessions: Dict[int, RealTimePostureSession] = {}
    
    def _generate_mock_posture_data(self) -> Dict[str, Any]:
        """生成虚拟的坐姿检测数据"""
        random_val = random.random()
        
        if random_val > 0.9:
            status = "danger"
            score = random.randint(30, 50)
            head_angle = random.randint(25, 40)
            shoulder_balance = "不平衡"
            back_curve = "过度弯曲"
            eye_distance = random.randint(20, 30)
            message = "坐姿严重不良，请立即调整！"
            recommendation = "请坐直身体，保持眼睛与屏幕距离40-50厘米"
        elif random_val > 0.7:
            status = "warning"
            score = random.randint(50, 70)
            head_angle = random.randint(10, 20)
            shoulder_balance = "需注意"
            back_curve = "轻微弯曲"
            eye_distance = random.randint(30, 40)
            message = "坐姿需要注意调整"
            recommendation = "请稍微坐直一些"
        else:
            status = "good"
            score = random.randint(70, 100)
            head_angle = random.randint(0, 8)
            shoulder_balance = "良好"
            back_curve = "正常"
            eye_distance = random.randint(40, 50)
            message = "坐姿良好，请保持"
            recommendation = "请继续保持正确坐姿"
        
        return {
            "status": status,
            "score": score,
            "head_angle": head_angle,
            "shoulder_balance": shoulder_balance,
            "back_curve": back_curve,
            "eye_distance": eye_distance,
            "message": message,
            "details": {
                "recommendation": recommendation
            }
        }
    
    def get_or_create_session(self, user_id: int) -> RealTimePostureSession:
        if user_id not in self.sessions:
            self.sessions[user_id] = RealTimePostureSession(user_id)
        return self.sessions[user_id]
    
    def start_session(self, user_id: int):
        session = self.get_or_create_session(user_id)
        session.is_active = True
        session.start_time = datetime.utcnow()
        session.end_time = None
    
    def stop_session(self, user_id: int):
        if user_id in self.sessions:
            session = self.sessions[user_id]
            session.is_active = False
            session.end_time = datetime.utcnow()
        
        return self.generate_report(user_id)
    
    def generate_report(self, user_id: int) -> Dict[str, Any]:
        """生成详细的坐姿检测报告"""
        session = self.get_or_create_session(user_id)
        stats = session.get_statistics()
        
        # 生成报告内容
        recommendations = []
        if stats["average_score"] < 70:
            recommendations.append("建议每30分钟休息一次，活动颈部和肩部")
        if stats["warning_count"] > stats["detection_count"] * 0.3:
            recommendations.append("注意保持背部挺直，避免弯腰驼背")
        if stats["bad_posture_count"] > 0:
            recommendations.append("调整座椅高度，确保眼睛与屏幕保持适当距离")
        
        if not recommendations:
            recommendations.append("继续保持良好的坐姿习惯")
        
        report = {
            "report_time": datetime.utcnow().isoformat(),
            "session_duration": stats["session_duration"],
            "total_detections": stats["detection_count"],
            "average_score": stats["average_score"],
            "good_posture_rate": stats["good_posture_rate"],
            "bad_posture_count": stats["bad_posture_count"],
            "warning_count": stats["warning_count"],
            "recommendations": recommendations,
            "summary": self._generate_summary(stats)
        }
        
        return report
    
    def _generate_summary(self, stats: Dict[str, Any]) -> str:
        """生成总结性文字"""
        if stats["average_score"] >= 80:
            return "本次检测坐姿表现优秀，请继续保持！"
        elif stats["average_score"] >= 60:
            return "本次检测坐姿基本合格，但仍有改进空间。"
        else:
            return "本次检测坐姿需要特别注意，建议及时调整学习姿势。"
    
    def get_session_stats(self, user_id: int) -> Dict[str, Any]:
        if user_id not in self.sessions:
            return {
                "is_active": False,
                "statistics": {
                    "detection_count": 0,
                    "good_posture_rate": 0,
                    "bad_posture_count": 0,
                    "warning_count": 0,
                    "average_score": 0,
                    "session_duration": 0
                }
            }
        
        session = self.sessions[user_id]
        stats = session.get_statistics()
        stats["is_active"] = session.is_active
        
        return stats
    
    async def process_video_frame(
        self,
        user_id: int,
        frame_data: bytes
    ) -> Dict[str, Any]:
        session = self.get_or_create_session(user_id)
        
        current_time = time.time()
        if current_time - session.last_detection_time < session.detection_interval:
            return {
                "success": True,
                "skipped": True,
                "message": "检测间隔太短，已跳过"
            }
        
        session.last_detection_time = current_time
        
        try:
            # 使用虚拟数据
            result_dict = self._generate_mock_posture_data()
            session.add_detection_result(result_dict)
            
            return {
                "success": True,
                "data": result_dict
            }
                
        except Exception as e:
            print(f"视频帧处理错误：{e}")
            return {
                "success": False,
                "error": str(e)
            }


_video_stream_service = None


def get_video_stream_service() -> VideoStreamPostureService:
    global _video_stream_service
    if _video_stream_service is None:
        _video_stream_service = VideoStreamPostureService()
    return _video_stream_service
