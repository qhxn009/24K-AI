"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain } from "lucide-react";
import { useState } from "react";

interface ThinkingPanelProps {
  content: string;
  isStreaming: boolean;
}

export function ThinkingPanel({ content, isStreaming }: ThinkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-full"
      >
        <Brain size={14} className={isStreaming ? "animate-pulse-glow text-[var(--accent-gold)]" : "text-[var(--accent-gold)]"} />
        <span className="flex-1 text-left">
          {isStreaming ? "深度分析中..." : `思考过程 (${content.length} 字)`}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)]/30 border border-[var(--border-secondary)] text-xs leading-relaxed text-[var(--text-muted)] max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap">{content}</p>
              {isStreaming && (
                <span className="inline-block w-1.5 h-3 bg-[var(--accent-gold)] ml-0.5 animate-pulse" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 思考完成后自动折叠 */}
      {!isStreaming && isExpanded && (
        <AutoCollapse onCollapse={() => setIsExpanded(false)} />
      )}
    </div>
  );
}

/** 思考完成后自动折叠 */
function AutoCollapse({ onCollapse }: { onCollapse: () => void }) {
  // 使用 useEffect 在内容稳定后自动折叠
  useState(() => {
    const timer = setTimeout(onCollapse, 1500);
    return () => clearTimeout(timer);
  });

  return null;
}
