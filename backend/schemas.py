from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """用户聊天请求"""
    message: str = Field(..., description="用户消息内容", min_length=1)
    conversation_id: str | None = Field(default=None, description="会话ID")
    history: list[dict] = Field(default_factory=list, description="历史消息列表")


class ToolCallInfo(BaseModel):
    """工具调用信息"""
    id: str
    name: str
    arguments: dict


class ToolResultInfo(BaseModel):
    """工具调用结果"""
    name: str
    data: dict | list | str | None = None
    error: str | None = None
