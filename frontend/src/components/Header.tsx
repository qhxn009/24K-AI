"use client";

import { Activity, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-[var(--border-secondary)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dim)] flex items-center justify-center">
            <span className="text-[var(--bg-primary)] font-bold text-[10px] font-[var(--font-mono)]">
              24K
            </span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block">
            24K-AI
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--border-primary)]" />
        <span className="text-xs text-[var(--text-muted)] hidden sm:block">
          金融智能分析
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* 模型标识 */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
          <Activity size={12} className="text-green-400" />
          <span className="text-[10px] text-[var(--text-secondary)] font-[var(--font-mono)]">
            GLM-4.7-Flash
          </span>
        </div>

        {/* 主题切换按钮 */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold-glow)] transition-all duration-200"
          title={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
          aria-label="切换主题"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
