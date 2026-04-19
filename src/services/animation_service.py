import asyncio
import json
import os
from typing import AsyncGenerator, List, Optional
from dotenv import load_dotenv

try:
    from openai import AsyncOpenAI, OpenAIError
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    AsyncOpenAI = None
    OpenAIError = None

load_dotenv()

ANIMATION_SYSTEM_PROMPT = """请你生成一个非常精美的动态动画，讲讲 {{topic}}
要动态的，要像一个完整的，正在播放的视频。包含一个完整的过程，能把知识点讲清楚。
页面极为精美，好看，有设计感，同时能够很好的传达知识。知识和图像要准确
附带一些旁白式的文字解说，从头到尾讲清楚一个小的知识点
不需要任何互动按钮，直接开始播放
使用和谐好看，广泛采用的浅色配色方案，使用很多的，丰富的视觉元素。双语字幕
页面宽度 100%，高度 500px
请保证任何一个元素都在正确的位置，避免穿模，字幕遮挡，图形位置错误等等问题影响正确的视觉传达
html+css+js+svg，放进一个html里
请只返回 HTML 代码，不要其他说明文字。"""

class AnimationService:
    def __init__(self):
        self.api_key = os.getenv("QWEN_API_KEY")
        self.base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        self.model = "qwen3.5-plus"
        self.client = None
        
        if HAS_OPENAI and self.api_key and self.api_key != "your-qwen-api-key":
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
    
    def is_available(self):
        return self.client is not None
    
    async def generate_animation_stream(
        self,
        topic: str,
        history: Optional[List[dict]] = None
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            yield json.dumps({"error": "Animation service is not available"}, ensure_ascii=False)
            return
        
        history = history or []
        system_prompt = ANIMATION_SYSTEM_PROMPT.replace("{{topic}}", topic)
        
        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": topic},
        ]
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                temperature=0.8,
            )
            
            async for chunk in response:
                delta = chunk.choices[0].delta
                token = delta.content or ""
                if token:
                    yield json.dumps({"token": token}, ensure_ascii=False)
                    await asyncio.sleep(0.001)
            
            yield json.dumps({"event": "[DONE]"}, ensure_ascii=False)
            
        except OpenAIError as e:
            yield json.dumps({"error": str(e)}, ensure_ascii=False)
            return
    
    async def generate_animation(
        self,
        topic: str,
        history: Optional[List[dict]] = None
    ) -> str:
        if not self.is_available():
            return "抱歉，动画生成服务不可用"
        
        history = history or []
        system_prompt = ANIMATION_SYSTEM_PROMPT.replace("{{topic}}", topic)
        
        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": topic},
        ]
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=False,
                temperature=0.8,
            )
            
            return response.choices[0].message.content
            
        except OpenAIError as e:
            return f"抱歉，发生了一些问题：{str(e)}"


_animation_service = None

def get_animation_service() -> AnimationService:
    global _animation_service
    if _animation_service is None:
        _animation_service = AnimationService()
    return _animation_service
