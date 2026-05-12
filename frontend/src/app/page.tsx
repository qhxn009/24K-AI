"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { useChatStream } from "@/hooks/useChatStream";
import { useChatHistory } from "@/hooks/useChatHistory";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatStream = useChatStream();
  const chatHistory = useChatHistory();

  // 同步消息到会话历史
  useEffect(() => {
    if (chatHistory.activeId && chatStream.messages.length > 0) {
      chatHistory.updateConversationMessages(chatHistory.activeId, chatStream.messages);
    }
  }, [chatStream.messages, chatHistory.activeId]);

  const handleSendMessage = useCallback(
    (content: string) => {
      // 如果没有活跃会话，创建一个新会话
      if (!chatHistory.activeId) {
        chatHistory.createConversation();
      }
      chatStream.sendMessage(content);
    },
    [chatHistory, chatStream]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      chatHistory.setActiveId(id);
      const conv = chatHistory.conversations.find((c) => c.id === id);
      if (conv) {
        // 加载该会话的消息
        chatStream.clearMessages();
        // 直接设置消息（通过重新触发）
        chatStream.clearMessages();
      }
      // 移动端关闭侧边栏
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    [chatHistory, chatStream]
  );

  const handleNewConversation = useCallback(() => {
    chatHistory.createConversation();
    chatStream.clearMessages();
  }, [chatHistory, chatStream]);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      chatHistory.deleteConversation(id);
      if (chatHistory.activeId === id) {
        chatStream.clearMessages();
      }
    },
    [chatHistory, chatStream]
  );

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] bg-noise bg-grid-pattern overflow-hidden">
      <Sidebar
        conversations={chatHistory.conversations}
        activeId={chatHistory.activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <ChatArea
        messages={chatStream.messages}
        isStreaming={chatStream.isStreaming}
        currentThinking={chatStream.currentThinking}
        currentContent={chatStream.currentContent}
        activeToolCalls={chatStream.activeToolCalls}
        error={chatStream.error}
        onSendMessage={handleSendMessage}
        onStopStreaming={chatStream.stopStreaming}
      />
    </div>
  );
}
