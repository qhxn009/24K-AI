"""
智谱 GLM-4.7-Flash 流式调用 + Tool Call 拦截核心逻辑。

核心工作流：
1. 发起流式请求（开启深度思考 + 工具调用）
2. 流式处理：reasoning_content → SSE thinking；content → SSE content；tool_calls → 累积
3. 流结束后检查 tool_calls：有则调用 MCP → 追加上下文 → 再次请求（循环）
4. 无 tool_calls → 结束
"""

import json
import logging
from typing import AsyncGenerator

from zai import ZhipuAiClient

from config import ZHIPU_API_KEY, MODEL_NAME, MAX_TOKENS, TEMPERATURE, MAX_TOOL_CALL_ROUNDS
from tool_registry import TOOLS_SCHEMA
from mcp_client import call_mcp_tool
from system_prompt import SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# 初始化智谱客户端
client = ZhipuAiClient(api_key=ZHIPU_API_KEY)


def sse_format(event_type: str, data) -> str:
    """格式化为 SSE 字符串"""
    json_str = json.dumps({"type": event_type, "data": data}, ensure_ascii=False)
    return f"data: {json_str}\n\n"


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    核心流式对话函数，处理完整的思考 + 工具调用循环。

    Args:
        messages: 对话消息列表（包含 system prompt + 历史消息 + 用户消息）

    Yields:
        SSE 格式的事件字符串
    """
    # 确保第一条消息是 system prompt
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    round_count = 0

    while round_count < MAX_TOOL_CALL_ROUNDS:
        round_count += 1
        logger.info(f"[LLM] 第 {round_count} 轮请求，消息数: {len(messages)}")

        reasoning_content = ""
        content = ""
        tool_calls_accumulated = []

        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS_SCHEMA,
                thinking={"type": "enabled"},
                stream=True,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
            )
        except Exception as e:
            logger.error(f"[LLM] 请求失败: {e}")
            yield sse_format("error", {"message": f"模型请求失败: {str(e)}"})
            yield sse_format("done", None)
            return

        # 流式读取响应
        try:
            for chunk in response:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta

                # 1. 处理深度思考内容
                if hasattr(delta, "reasoning_content") and delta.reasoning_content:
                    reasoning_content += delta.reasoning_content
                    yield sse_format("thinking", delta.reasoning_content)

                # 2. 处理正式回答内容
                if hasattr(delta, "content") and delta.content:
                    content += delta.content
                    yield sse_format("content", delta.content)

                # 3. 处理工具调用（流式累积）
                if hasattr(delta, "tool_calls") and delta.tool_calls:
                    for tc in delta.tool_calls:
                        idx = tc.index if hasattr(tc, "index") and tc.index is not None else 0
                        # 确保 tool_calls_accumulated 长度足够
                        while idx >= len(tool_calls_accumulated):
                            tool_calls_accumulated.append({
                                "id": "",
                                "type": "function",
                                "function": {"name": "", "arguments": ""},
                            })
                        # 累积工具调用信息
                        if tc.id:
                            tool_calls_accumulated[idx]["id"] = tc.id
                        if hasattr(tc, "function") and tc.function:
                            if tc.function.name:
                                tool_calls_accumulated[idx]["function"]["name"] = tc.function.name
                            if tc.function.arguments:
                                tool_calls_accumulated[idx]["function"]["arguments"] += tc.function.arguments

        except Exception as e:
            logger.error(f"[LLM] 流式读取失败: {e}")
            yield sse_format("error", {"message": f"流式读取失败: {str(e)}"})
            yield sse_format("done", None)
            return

        # 如果没有工具调用，结束循环
        if not tool_calls_accumulated:
            break

        logger.info(f"[LLM] 检测到 {len(tool_calls_accumulated)} 个工具调用")

        # 4. 将 assistant 消息（含 reasoning_content + tool_calls）追加到 messages
        assistant_msg = {
            "role": "assistant",
            "content": content or None,
        }
        # 添加 reasoning_content（交错式思考需要传回）
        if reasoning_content:
            assistant_msg["reasoning_content"] = reasoning_content
        # 添加 tool_calls
        assistant_msg["tool_calls"] = [
            {
                "id": tc["id"],
                "type": "function",
                "function": tc["function"],
            }
            for tc in tool_calls_accumulated
        ]
        messages.append(assistant_msg)

        # 5. 逐个执行工具调用
        for tc in tool_calls_accumulated:
            func_name = tc["function"]["name"]
            func_args_str = tc["function"]["arguments"]

            # 解析工具参数
            try:
                func_args = json.loads(func_args_str) if func_args_str else {}
            except json.JSONDecodeError as e:
                logger.error(f"[LLM] 工具参数解析失败: {e}, 原始参数: {func_args_str}")
                func_args = {}

            # 通知前端工具调用开始
            yield sse_format("tool_call", {"name": func_name, "arguments": func_args})

            # 调用 MCP 工具
            try:
                result = await call_mcp_tool(func_name, func_args)
                yield sse_format("tool_result", {"name": func_name, "data": result})
                logger.info(f"[LLM] 工具 {func_name} 调用成功")
            except Exception as e:
                error_result = {"error": str(e)}
                yield sse_format("tool_result", {"name": func_name, "data": error_result, "error": str(e)})
                logger.error(f"[LLM] 工具 {func_name} 调用失败: {e}")
                result = str(e)

            # 追加 tool 角色消息到上下文
            messages.append({
                "role": "tool",
                "content": json.dumps(result, ensure_ascii=False) if not isinstance(result, str) else result,
                "tool_call_id": tc["id"],
            })

        # 6. 循环回到顶部，带着工具结果再次请求智谱
        # 重置本轮累积的内容
        reasoning_content = ""
        content = ""

    # 所有轮次结束
    yield sse_format("done", None)
    logger.info("[LLM] 对话完成")
