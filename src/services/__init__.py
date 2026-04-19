from .ai_service import get_deepseek_service, get_photo_search_service, DeepSeekService
from .ocr_service import get_aliyun_ocr_service, AliyunOCRService
from .health_summary_service import get_health_summary_service, HealthSummaryService
from .doubao_vision_service import get_doubao_vision_service, DoubaoVisionService

def get_deepseek_service_with_key(direct_api_key: str, system_prompt: str):
    return DeepSeekService(direct_api_key=direct_api_key, system_prompt=system_prompt)

__all__ = [
    "get_deepseek_service",
    "get_photo_search_service",
    "DeepSeekService",
    "get_deepseek_service_with_key",
    "get_aliyun_ocr_service",
    "AliyunOCRService",
    "get_health_summary_service",
    "HealthSummaryService",
    "get_doubao_vision_service",
    "DoubaoVisionService",
]
