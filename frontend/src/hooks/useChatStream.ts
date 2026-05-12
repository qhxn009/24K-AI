"use client";

import { useState, useRef, useCallback } from "react";
import type { Message, ToolCallInfo, ToolResultInfo, SSEEvent } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { parseSSEChunk } from "@/lib/sse-parser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface UseChatStreamReturn {
  messages: Message[];
  isStreaming: boolean;
  currentThinking: string;
  currentContent: string;
  activeToolCalls: ToolCallInfo[];
  error: string | null;
  sendMessage: (content: string, history?: { role: string; content: string }[]) => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => void;
}

export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThinking, setCurrentThinking] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCallInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentThinking("");
    setCurrentContent("");
    setActiveToolCalls([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string, history?: { role: string; content: string }[]) => {
      if (!content.trim() || isStreaming) return;

      // 清除之前的错误
      setError(null);
      setCurrentThinking("");
      setCurrentContent("");
      setActiveToolCalls([]);

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        thinking: "",
        toolCalls: [],
        toolResults: [],
        timestamp: Date.now(),
      };

      // 创建空的 AI 消息占位
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        thinking: "",
        toolCalls: [],
        toolResults: [],
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // 创建 AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 当前流式累积的状态
      let accumulatedThinking = "";
      let accumulatedContent = "";
      let accumulatedToolCalls: ToolCallInfo[] = [];
      let accumulatedToolResults: ToolResultInfo[] = [];

      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            history: history || [],
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法获取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = parseSSEChunk(buffer);

          for (const event of events) {
            handleSSEEvent(event, {
              onThinking: (text) => {
                accumulatedThinking += text;
                setCurrentThinking(accumulatedThinking);
              },
              onContent: (text) => {
                accumulatedContent += text;
                setCurrentContent(accumulatedContent);
              },
              onToolCall: (tc) => {
                accumulatedToolCalls = [...accumulatedToolCalls, tc];
                setActiveToolCalls(accumulatedToolCalls);
              },
              onToolResult: (tr) => {
                accumulatedToolResults = [...accumulatedToolResults, tr];
              },
              onError: (msg) => {
                setError(msg);
              },
              onDone: () => {
                // 流结束，固定 AI 消息
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          thinking: accumulatedThinking,
                          toolCalls: accumulatedToolCalls,
                          toolResults: accumulatedToolResults,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
                setCurrentThinking("");
                setCurrentContent("");
                setActiveToolCalls([]);
                setIsStreaming(false);
              },
            });
          }

          // 清除已处理的 buffer
          const lastNewline = buffer.lastIndexOf("\n\n");
          if (lastNewline !== -1) {
            buffer = buffer.slice(lastNewline + 2);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // 用户主动中断
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: accumulatedContent || "（已中断生成）",
                    thinking: accumulatedThinking,
                    toolCalls: accumulatedToolCalls,
                    toolResults: accumulatedToolResults,
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          const errorMsg = err instanceof Error ? err.message : "未知错误";
          setError(errorMsg);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
        setIsStreaming(false);
        setCurrentThinking("");
        setCurrentContent("");
        setActiveToolCalls([]);
      }
    },
    [isStreaming]
  );

  return {
    messages,
    isStreaming,
    currentThinking,
    currentContent,
    activeToolCalls,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}

/** SSE 事件处理器 */
function handleSSEEvent(
  event: SSEEvent,
  handlers: {
    onThinking: (text: string) => void;
    onContent: (text: string) => void;
    onToolCall: (tc: ToolCallInfo) => void;
    onToolResult: (tr: ToolResultInfo) => void;
    onError: (msg: string) => void;
    onDone: () => void;
  }
) {
  const { type, data } = event;

  switch (type) {
    case "thinking":
      if (typeof data === "string") {
        handlers.onThinking(data);
      }
      break;

    case "content":
      if (typeof data === "string") {
        handlers.onContent(data);
      }
      break;

    case "tool_call":
      if (data && typeof data === "object") {
        handlers.onToolCall({
          name: (data as Record<string, unknown>).name as string,
          arguments: ((data as Record<string, unknown>).arguments as Record<string, unknown>) || {},
        });
      }
      break;

    case "tool_result":
      if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        handlers.onToolResult({
          name: d.name as string,
          data: d.data,
          error: d.error as string | undefined,
        });
      }
      break;

    case "error":
      if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        handlers.onError((d.message as string) || "未知错误");
      } else if (typeof data === "string") {
        handlers.onError(data);
      }
      break;

    case "done":
      handlers.onDone();
      break;
  }
}
