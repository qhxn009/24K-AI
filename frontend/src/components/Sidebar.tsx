"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { Conversation } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {/* 移动端遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed lg:relative z-50 h-full flex-shrink-0 overflow-hidden",
          "border-r border-[var(--border-secondary)]",
          "bg-[var(--bg-secondary)]"
        )}
      >
        <div className="w-[280px] h-full flex flex-col">
          {/* 顶部 */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)] flex items-center justify-center">
                <span className="text-[var(--bg-primary)] font-bold text-sm font-[var(--font-mono)]">
                  24K
                </span>
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                24K-AI
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors lg:block hidden"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* 新建对话按钮 */}
          <div className="p-3">
            <button
              onClick={onNew}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg",
                "border border-dashed border-[var(--border-primary)]",
                "text-[var(--text-secondary)] hover:text-[var(--accent-gold)]",
                "hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold-glow)]",
                "transition-all duration-200 text-sm"
              )}
            >
              <Plus size={16} />
              <span>新建对话</span>
            </button>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <AnimatePresence initial={false}>
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer",
                    "transition-all duration-150",
                    activeId === conv.id
                      ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <MessageSquare size={14} className="flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{conv.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(conv.updatedAt)}
                    </p>
                  </div>
                  <AnimatePresence>
                    {hoveredId === conv.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {conversations.length === 0 && (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                暂无对话记录
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* 折叠时的展开按钮 */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-lg"
        >
          <PanelLeft size={16} />
        </button>
      )}
    </>
  );
}
