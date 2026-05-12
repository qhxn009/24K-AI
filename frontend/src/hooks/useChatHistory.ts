"use client";

import { useState, useEffect, useCallback } from "react";
import type { Conversation, Message } from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "24k-ai-conversations";

interface UseChatHistoryReturn {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  setActiveId: (id: string | null) => void;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  updateConversationMessages: (id: string, messages: Message[]) => void;
  clearAll: () => void;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Conversation[];
        setConversations(parsed);
        // 激活最近更新的会话
        if (parsed.length > 0) {
          const latest = parsed.reduce((a, b) =>
            a.updatedAt > b.updatedAt ? a : b
          );
          setActiveId(latest.id);
        }
      }
    } catch {
      // 忽略解析错误
    }
    setLoaded(true);
  }, []);

  // 持久化到 localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // 忽略存储错误
    }
  }, [conversations, loaded]);

  const activeConversation =
    conversations.find((c) => c.id === activeId) || null;

  const createConversation = useCallback((): string => {
    const id = generateId();
    const newConv: Conversation = {
      id,
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c
      )
    );
  }, []);

  const updateConversationMessages = useCallback(
    (id: string, messages: Message[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          // 自动生成标题：取第一条用户消息的前 20 个字符
          const firstUserMsg = messages.find((m) => m.role === "user");
          const autoTitle =
            c.title === "新对话" && firstUserMsg
              ? firstUserMsg.content.slice(0, 20) +
                (firstUserMsg.content.length > 20 ? "..." : "")
              : c.title;
          return {
            ...c,
            title: autoTitle,
            messages,
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
    updateConversationMessages,
    clearAll,
  };
}
