"""
FastAPI 入口：定义 HTTP 端点，处理 CORS，桥接 LLM 服务。
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from config import CORS_ORIGINS, BACKEND_HOST, BACKEND_PORT
from schemas import ChatRequest
from llm_service import stream_chat

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="24K-AI Finance Chat",
    description="金融 AI 对话服务 — 智谱 GLM + 广发证券 MCP",
    version="1.0.0",
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    """健康检查端点"""
    return {"status": "ok", "service": "24K-AI Finance Chat"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    SSE 流式对话端点。

    接收用户消息，返回 Server-Sent Events 流，包含：
    - thinking: 深度思考过程
    - content: 正式回答内容
    - tool_call: 工具调用通知
    - tool_result: 工具调用结果
    - error: 错误信息
    - done: 流结束标记
    """
    logger.info(f"[API] 收到聊天请求: {request.message[:50]}...")

    # 构建消息列表
    messages = []
    # 添加历史消息
    for msg in request.history:
        messages.append(msg)
    # 添加当前用户消息
    messages.append({"role": "user", "content": request.message})

    return StreamingResponse(
        stream_chat(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=True,
        log_level="info",
    )
