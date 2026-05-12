"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Message, ToolCallInfo, ToolResultInfo } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ThinkingPanel } from "./ThinkingPanel";
import { ChatInput } from "./ChatInput";
import { Header } from "./Header";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  currentThinking: string;
  currentContent: string;
  activeToolCalls: ToolCallInfo[];
  error: string | null;
  onSendMessage: (content: string) => void;
  onStopStreaming: () => void;
}

export function ChatArea({
  messages,
  isStreaming,
  currentThinking,
  currentContent,
  activeToolCalls,
  error,
  onSendMessage,
  onStopStreaming,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentContent, currentThinking, activeToolCalls]);

  // 获取最后一条 AI 消息（用于流式渲染）
  const lastMessage = messages[messages.length - 1];
  const isLastStreaming = lastMessage?.isStreaming;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <Header />

      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <WelcomeScreen onSendMessage={onSendMessage} />
          )}

          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {msg.role === "user" ? (
                  <UserBubble content={msg.content} />
                ) : (
                  <div>
                    {/* 思考面板 */}
                    {(msg.thinking || (isLast && isLastStreaming && currentThinking)) && (
                      <ThinkingPanel
                        content={isLast && isLastStreaming ? currentThinking : msg.thinking}
                        isStreaming={!!(isLast && isLastStreaming && currentThinking)}
                      />
                    )}

                    {/* 工具调用状态 */}
                    {(msg.toolResults.length > 0 || (isLast && isLastStreaming && activeToolCalls.length > 0)) && (
                      <ToolCallStatus
                        toolCalls={isLast && isLastStreaming ? activeToolCalls : msg.toolCalls.map(tc => ({ name: tc.name, arguments: tc.arguments }))}
                        toolResults={isLast && isLastStreaming ? [] : msg.toolResults}
                      />
                    )}

                    {/* 消息内容 */}
                    <MessageBubble
                      content={isLast && isLastStreaming ? currentContent : msg.content}
                      toolResults={msg.toolResults}
                      isStreaming={!!(isLast && isLastStreaming && !currentContent)}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* 错误提示 */}
          {error && <ErrorBanner message={error} />}
        </div>
      </div>

      {/* 输入区 */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}

/** 用户消息气泡 */
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
        style={{
          background: "linear-gradient(135deg, var(--user-bubble-from), var(--user-bubble-to))",
          color: "var(--user-bubble-text)",
          fontWeight: 500,
        }}
      >
        {content}
      </div>
    </div>
  );
}

/** 工具调用状态指示器 */
function ToolCallStatus({
  toolCalls,
  toolResults,
}: {
  toolCalls: { name: string; arguments: Record<string, unknown> }[];
  toolResults: ToolResultInfo[];
}) {
  const toolNames = [
    ...toolCalls.map((tc) => tc.name),
    ...toolResults.map((tr) => tr.name),
  ];

  if (toolNames.length === 0) return null;

  const toolLabels: Record<string, string> = {
    lhb_aborttrade_market_date_get: "龙虎榜个股查询",
    lhb_aborttrade_market_code_date_get: "龙虎榜明细查询",
    lhb_aborttrade_stock_market_code_get: "个股龙虎榜记录",
    lhb_stat_stock_months_get: "龙虎榜排行统计",
    lhb_stat_stock_market_code_months_get: "个股龙虎榜统计",
    lhb_stat_dept_id_months_get: "营业部统计",
    lhb_outline_plate_get: "龙虎榜概括",
    lhb_calendar_market_month_get: "龙虎榜日历",
    lhb_aborttrade_batchstock_post: "批量龙虎榜查询",
    commonBasic: "基本指标查询",
    commonIndicator: "指标对比",
    commonIndustryInfo: "行业信息",
    commonIndustryTop2: "行业前二",
    commonReportType: "报告期查询",
    commonTrend: "PE/PB走势",
    majorIndicatorAggregation: "财务聚合",
    majorIndicatorBank: "银行指标",
    majorIndicatorCashflow: "现金流量表",
    majorIndicatorInsurance: "保险指标",
    majorIndicatorLiabilty: "资产负债表",
    majorIndicatorMainBusiness: "主营业务构成",
    majorIndicatorProfit: "利润表",
    majorIndicatorSecurities: "证券指标",
    analyzeProfitAbility: "盈利能力分析",
    analyzeCapitalStructure: "资本结构分析",
    analyzeCrashflow: "现金流量分析",
    "finance-api_product_etf_rank_get": "ETF榜单",
    valuation_windmill_get: "指数估值",
  };

  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse-glow" />
        <span className="text-[var(--text-secondary)]">
          正在调用: {toolNames.map((n) => toolLabels[n] || n).join("、")}
        </span>
      </div>
    </div>
  );
}

/** 错误提示 */
function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
    >
      ⚠️ {message}
    </motion.div>
  );
}

/** 欢迎页面 */
function WelcomeScreen({ onSendMessage }: { onSendMessage: (content: string) => void }) {
  const suggestions = [
    { label: "📈 查看今日龙虎榜", message: "帮我查看今日沪深两市的龙虎榜数据" },
    { label: "📊 浦发银行财务分析", message: "分析一下浦发银行(SH600000)的财务状况" },
    { label: "⭐ 热门ETF排行", message: "查看今日ETF涨幅榜前10" },
    { label: "📉 指数估值分析", message: "查看当前主要指数的估值分位数据" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dim)] flex items-center justify-center shadow-lg glow-gold">
          <span className="text-[var(--bg-primary)] font-bold text-2xl font-[var(--font-mono)]">
            24K
          </span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        欢迎使用 24K-AI
      </motion.h1>

      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-[var(--text-secondary)] mb-10 text-sm max-w-md"
      >
        满血版免费AI大模型 驱动的 A 股实时行情与深度分析平台；
      </motion.p>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
      >
        {suggestions.map((s) => (
          <button
            key={s.message}
            onClick={() => onSendMessage(s.message)}
            className="px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold-glow)] transition-all duration-200 text-left"
          >
            {s.label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
