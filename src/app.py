import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

load_dotenv()

app = FastAPI(
    title="青少年智能学习平台 API",
    description="基于AI可移动设备的青少年智能学习平台后端API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 挂载静态文件
app.mount("/static", StaticFiles(directory="web"), name="static")

@app.get("/")
async def root():
    """根路径 - 返回前端页面"""
    index_path = os.path.join("web", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "青少年智能学习平台 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


from src.api import auth, learning, questions, health, assistant, resources, ocr, ai_teachers

app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(learning.router, prefix="/api/v1/learning", tags=["学习"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["错题本"])
app.include_router(health.router, prefix="/api/v1/health", tags=["健康监测"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["AI助手"])
app.include_router(resources.router, prefix="/api/v1/resources", tags=["学习资源"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["OCR识别"])
app.include_router(ai_teachers.router, prefix="/api/v1/ai-teachers", tags=["个性化AI教师"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("src.app:app", host=host, port=port, reload=True)
