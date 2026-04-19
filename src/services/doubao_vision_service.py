import os
import base64
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

class PostureAnalysisResult(BaseModel):
    status: str
    score: float
    head_angle: float
    shoulder_balance: str
    back_curve: str
    eye_distance: float
    details: Dict[str, Any]
    message: str

    def to_dict(self):
        return {
            "status": self.status,
            "score": self.score,
            "head_angle": self.head_angle,
            "shoulder_balance": self.shoulder_balance,
            "back_curve": self.back_curve,
            "eye_distance": self.eye_distance,
            "details": self.details,
            "message": self.message
        }

SYSTEM_PROMPT = """你是一个专业的坐姿检测AI智能体。你的核心任务是分析图片中的人物坐姿，提供精准的评估和具体的改进建议。

请以JSON格式返回结果，格式如下：
{
    "status": "good",
    "score": 85,
    "head_angle": 5,
    "shoulder_balance": "良好",
    "back_curve": "正常",
    "eye_distance": 45,
    "message": "坐姿良好，继续保持！",
    "details": {
        "recommendation": "建议每30分钟休息一下眼睛",
        "issues": []
    }
}

字段说明：
- status: 坐姿状态，必须是以下三个值之一：
  * "good": 坐姿良好（评分>=70分）
  * "warning": 需注意（50<=评分<70分）
  * "danger": 需纠正（评分<50分）
- score: 综合评分，0-100分，根据坐姿标准严格评分
- head_angle: 头部倾斜角度（度），0-45度，估算头部前倾或侧倾的角度
- shoulder_balance: 肩部平衡描述，必须是："良好"、"需注意"、"不平衡"
- back_curve: 背部弯曲描述，必须是："正常"、"轻微弯曲"、"过度弯曲"
- eye_distance: 眼睛距离屏幕的估计距离（厘米），20-60cm
- message: 简短的评价消息，10-20字
- details: 详细信息
  * recommendation: 具体的建议，20-50字
  * issues: 发现的问题列表，字符串数组

评估标准（请严格按照此标准）：
1. 头部：过度前倾>20度或侧倾>15度扣分严重
2. 肩部：双肩不平衡或高低肩扣分
3. 背部：弯腰驼背扣分严重
4. 眼睛：距离屏幕<30cm或>60cm扣分
5. 整体：姿态端正、腰背挺直、双肩平衡为良好

请仔细分析图片，给出客观准确的评估！"""

class DoubaoVisionService:
    def __init__(self):
        self.api_key = ARK_API_KEY
        self.base_url = ARK_BASE_URL
        self.model = DOUBAO_MODEL
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )

    def encode_image(self, image_data: bytes) -> str:
        return base64.b64encode(image_data).decode('utf-8')

    async def analyze_posture(self, image_data: bytes) -> PostureAnalysisResult:
        try:
            image_base64 = self.encode_image(image_data)
            
            input_messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{image_base64}"
                        },
                        {
                            "type": "input_text",
                            "text": SYSTEM_PROMPT + "\n\n请分析这张图片中的人物坐姿，返回JSON格式的评估结果。"
                        },
                    ],
                }
            ]

            response = self.client.responses.create(
                model=self.model,
                input=input_messages
            )

            if not response or not hasattr(response, 'output') or not response.output:
                return self._get_fallback_result("API返回格式错误")

            content = None
            
            if isinstance(response.output, list) and len(response.output) > 0:
                output_item = response.output[0]
                if hasattr(output_item, 'content'):
                    content = output_item.content
                else:
                    content = str(output_item)
            else:
                content = str(response.output)
            
            if not content:
                return self._get_fallback_result("API返回内容为空")
                
            return self._parse_response(content)
                
        except Exception as e:
            print(f"豆包API调用错误: {e}")
            import traceback
            traceback.print_exc()
            return self._get_fallback_result(f"API请求失败: {str(e)}")

    def _parse_response(self, content: str) -> PostureAnalysisResult:
        try:
            json_str = content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].strip()

            data = json.loads(json_str)
            
            return PostureAnalysisResult(
                status=data.get("status", "good"),
                score=float(data.get("score", 80)),
                head_angle=float(data.get("head_angle", 0)),
                shoulder_balance=data.get("shoulder_balance", "良好"),
                back_curve=data.get("back_curve", "正常"),
                eye_distance=float(data.get("eye_distance", 45)),
                message=data.get("message", "坐姿检测完成"),
                details=data.get("details", {"recommendation": "请保持正确坐姿", "issues": []})
            )
            
        except Exception as e:
            print(f"解析响应错误: {e}, 内容: {content}")
            return self._get_fallback_result(f"解析失败: {str(e)}")

    def _get_fallback_result(self, error_msg: str) -> PostureAnalysisResult:
        return PostureAnalysisResult(
            status="warning",
            score=70,
            head_angle=5,
            shoulder_balance="良好",
            back_curve="正常",
            eye_distance=45,
            message=f"检测中... {error_msg}",
            details={"recommendation": "请保持正确坐姿", "issues": []}
        )


_doubao_vision_service: Optional[DoubaoVisionService] = None

def get_doubao_vision_service() -> DoubaoVisionService:
    global _doubao_vision_service
    if _doubao_vision_service is None:
        _doubao_vision_service = DoubaoVisionService()
    return _doubao_vision_service
