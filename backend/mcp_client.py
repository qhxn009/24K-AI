"""
广发证券 MCP 协议客户端。
使用 JSON-RPC 2.0 over HTTP POST 与广发 MCP 服务通信。
"""

import json
import uuid
import logging

import httpx

from tool_registry import route_tool_to_server

logger = logging.getLogger(__name__)


async def call_mcp_tool(tool_name: str, arguments: dict) -> dict | list | str:
    """
    调用广发证券 MCP 工具。

    Args:
        tool_name: 工具名称（如 lhb_aborttrade_market_date_get）
        arguments: 工具参数字典

    Returns:
        MCP 返回的数据（字典、列表或字符串）

    Raises:
        Exception: MCP 调用失败时抛出异常
    """
    url, headers = route_tool_to_server(tool_name)

    # MCP JSON-RPC 2.0 请求格式
    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments,
        },
    }

    logger.info(f"[MCP] 调用工具: {tool_name}, 参数: {arguments}")
    logger.info(f"[MCP] 端点: {url}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()

        logger.info(f"[MCP] 响应状态: {response.status_code}")

        # 解析 MCP 响应
        if "result" in result:
            mcp_result = result["result"]
            # MCP result.content 是一个数组，每个元素有 type 和 text
            if isinstance(mcp_result, dict) and "content" in mcp_result:
                content_list = mcp_result["content"]
                if isinstance(content_list, list) and len(content_list) > 0:
                    # 提取所有 text 内容
                    texts = []
                    for item in content_list:
                        if isinstance(item, dict) and item.get("type") == "text":
                            text_value = item.get("text", "")
                            # 尝试解析为 JSON
                            try:
                                parsed = json.loads(text_value)
                                texts.append(parsed)
                            except (json.JSONDecodeError, TypeError):
                                texts.append(text_value)
                    # 如果只有一个结果，直接返回
                    if len(texts) == 1:
                        return texts[0]
                    return texts
            return mcp_result
        elif "error" in result:
            error_info = result["error"]
            error_msg = f"MCP 错误: {error_info.get('message', str(error_info))}"
            logger.error(f"[MCP] {error_msg}")
            raise Exception(error_msg)
        else:
            logger.warning(f"[MCP] 未知响应格式: {result}")
            return result

    except httpx.TimeoutException:
        error_msg = f"MCP 请求超时: {tool_name}"
        logger.error(f"[MCP] {error_msg}")
        raise Exception(error_msg)
    except httpx.HTTPStatusError as e:
        error_msg = f"MCP HTTP 错误 {e.response.status_code}: {tool_name}"
        logger.error(f"[MCP] {error_msg}")
        raise Exception(error_msg)
    except httpx.RequestError as e:
        error_msg = f"MCP 请求失败: {e}"
        logger.error(f"[MCP] {error_msg}")
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"MCP 调用异常: {e}"
        logger.error(f"[MCP] {error_msg}")
        raise Exception(error_msg)
