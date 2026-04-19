from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import base64
import json
import time
import hashlib

from src.storage.database.mysql_db import get_session
from src.models.user import User
from src.api.auth import get_current_user
from src.services import get_deepseek_service, get_photo_search_service, get_aliyun_ocr_service

router = APIRouter()

# 简单的内存缓存，防止重复请求
_request_cache = {}
_CACHE_TTL = 60  # 60秒缓存

class OCRAnalyzeRequest(BaseModel):
    question_text: str
    subject: Optional[str] = None
    image_data: Optional[str] = None

def get_cache_key(data: str) -> str:
    """生成缓存键"""
    return hashlib.md5(data.encode()).hexdigest()

def is_duplicate_request(cache_key: str) -> bool:
    """检查是否是重复请求"""
    now = time.time()
    if cache_key in _request_cache:
        if now - _request_cache[cache_key] < _CACHE_TTL:
            return True
    _request_cache[cache_key] = now
    # 清理过期缓存
    for k in list(_request_cache.keys()):
        if now - _request_cache[k] > _CACHE_TTL * 2:
            del _request_cache[k]
    return False

@router.post("/recognize")
def ocr_recognize(
    file: UploadFile = File(None),
    image_data: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    if not file and not image_data and not image_url:
        raise HTTPException(status_code=400, detail="Either file, image_data or image_url is required")
    
    ocr_service = get_aliyun_ocr_service()
    
    image_bytes = None
    if file:
        image_bytes = file.file.read()
    elif image_data:
        try:
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image_data: {str(e)}")
    
    ocr_result = ocr_service.recognize_text(image_data=image_bytes, image_url=image_url)
    
    if "error" in ocr_result:
        return {
            "success": False,
            "error": ocr_result["error"],
            "data": ocr_result
        }
    
    return {
        "success": True,
        "data": ocr_result
    }

@router.post("/analyze")
def analyze_question(
    request: OCRAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    ai_service = get_deepseek_service()
    
    analysis_result = ai_service.analyze_question(request.question_text, request.subject)
    
    return {
        "success": True,
        "data": analysis_result
    }

@router.post("/photo-search")
def photo_search(
    file: UploadFile = File(None),
    image_data: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    if not file and not image_data and not image_url:
        raise HTTPException(status_code=400, detail="Either file, image_data or image_url is required")
    
    # 生成缓存键防止重复请求
    cache_input = f"{image_url or ''}_{subject or ''}_{current_user.id}"
    cache_key = get_cache_key(cache_input)
    if is_duplicate_request(cache_key):
        raise HTTPException(status_code=429, detail="请求处理中，请稍候")
    
    ocr_service = get_aliyun_ocr_service()
    ai_service = get_photo_search_service()
    
    image_bytes = None
    if file:
        image_bytes = file.file.read()
    elif image_data:
        try:
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image_data: {str(e)}")
    
    # 优化OCR调用，增加超时保护
    try:
        ocr_result = ocr_service.recognize_text(image_data=image_bytes, image_url=image_url)
    except Exception as e:
        return {
            "success": False,
            "error": f"OCR识别超时: {str(e)}"
        }
    
    if "error" in ocr_result:
        return {
            "success": False,
            "error": ocr_result["error"],
            "data": ocr_result
        }
    
    ocr_text = ocr_result.get("text", "") or ocr_result.get("content", "") or str(ocr_result)
    
    # 优化的提示词，明确要求Markdown格式
    analysis_prompt = f"""请分析以下题目，给出详细的讲解和思路引导。

题目内容：
{ocr_text}
{'科目：' + subject if subject else ''}

【重要】请严格按照以下要求输出：
1. 必须使用标准的Markdown格式
2. 所有数学公式必须使用LaTeX语法，用$包裹行内公式，用$$包裹块级公式
3. 包含以下六个部分，不要省略：

## 题目重述
提取或重写题目的核心内容，让学生明确要解决的问题。

## 思路分析
分步骤引导学生思考题目的解题方向，说明每一步的目的。

## 解题步骤
给出完整、详细的解题过程，包括计算、推理等。

## 公式
单独列出本题中涉及的核心数学、物理或化学公式。

## 答案
明确给出最终答案。

## 关键点
总结本题涉及的关键知识点或易错点。"""
    
    try:
        ai_response = ai_service.chat(analysis_prompt, [])
    except Exception as e:
        return {
            "success": False,
            "error": f"AI分析失败: {str(e)}",
            "data": {
                "ocr_result": ocr_result,
                "ocr_text": ocr_text
            }
        }
    
    return {
        "success": True,
        "data": {
            "ocr_result": ocr_result,
            "ocr_text": ocr_text,
            "ai_analysis": ai_response
        }
    }

@router.post("/photo-search/stream")
def photo_search_stream(
    file: UploadFile = File(None),
    image_data: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    if not file and not image_data and not image_url:
        raise HTTPException(status_code=400, detail="Either file, image_data or image_url is required")
    
    # Pre-read the file synchronously before the generator
    image_bytes = None
    if file:
        image_bytes = file.file.read()
    
    def generate():
        try:
            ocr_service = get_aliyun_ocr_service()
            ai_service = get_photo_search_service()
            
            nonlocal image_bytes
            local_image_data = image_data
            
            if local_image_data:
                try:
                    if local_image_data.startswith('data:image'):
                        local_image_data = local_image_data.split(',')[1]
                    image_bytes = base64.b64decode(local_image_data)
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'error', 'error': f'Invalid image_data: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
            
            ocr_result = ocr_service.recognize_text(image_data=image_bytes, image_url=image_url)
            
            if "error" in ocr_result:
                yield f"data: {json.dumps({'type': 'error', 'error': ocr_result['error']}, ensure_ascii=False)}\n\n"
                return
            
            ocr_text = ocr_result.get("text", "") or ocr_result.get("content", "") or str(ocr_result)
            
            yield f"data: {json.dumps({'type': 'ocr', 'ocr_text': ocr_text}, ensure_ascii=False)}\n\n"
            
            analysis_prompt = f"""请分析以下题目，给出详细的讲解和思路引导：

{ocr_text}

请严格使用标准的Markdown格式，并按以下六个部分组织内容：

## 题目重述
提取或重写题目的核心内容，让学生明确要解决的问题。

## 思路分析
分步骤引导学生思考题目的解题方向，说明每一步的目的。

## 解题步骤
给出完整、详细的解题过程，包括计算、推理等。

## 公式
单独列出本题中涉及的核心数学、物理或化学公式。

## 答案
明确给出最终答案。

## 关键点
总结本题涉及的关键知识点或易错点。

要求：所有数学公式必须使用LaTeX语法，用$包裹行内公式，用$$包裹块级公式。不要省略任何部分。"""
            
            full_response = []
            
            for chunk in ai_service.chat_stream(analysis_prompt, []):
                full_response.append(chunk)
                yield f"data: {json.dumps({'type': 'analysis', 'content': chunk}, ensure_ascii=False)}\n\n"
            
            yield f"data: {json.dumps({'type': 'done', 'complete': ''.join(full_response)}, ensure_ascii=False)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
