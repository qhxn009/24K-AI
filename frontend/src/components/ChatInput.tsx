"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    // 重置 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // 自动调整 textarea 高度
  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <div className="border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div
          className={cn(
            "flex items-end gap-3 px-4 py-3 rounded-xl",
            "border border-[var(--border-primary)]",
            "bg-[var(--input-bg)]",
            "focus-within:border-[var(--accent-gold)] focus-within:shadow-[var(--shadow-glow)]",
            "transition-all duration-200"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="输入您的金融分析问题..."
            rows={1}
            disabled={isStreaming}
            className={cn(
              "flex-1 bg-transparent text-sm text-[var(--text-primary)]",
              "placeholder:text-[var(--text-muted)]",
              "resize-none outline-none",
              "max-h-[200px] leading-relaxed",
              "disabled:opacity-50"
            )}
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg",
                "bg-red-500/20 text-red-400",
                "hover:bg-red-500/30 transition-colors"
              )}
              title="停止生成"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                value.trim()
                  ? "bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dim)] shadow-md"
                  : "bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed"
              )}
              title="发送消息"
            >
              <Send size={16} />
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
          数据来源于证券公司。分析结果仅供参考，不构成投资建议。技术支持：24KRMB.COM
        </p>
      </div>
    </div>
  );
}
