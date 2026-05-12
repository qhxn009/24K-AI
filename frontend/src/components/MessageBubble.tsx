"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ToolResultInfo } from "@/lib/types";

interface MessageBubbleProps {
  content: string;
  toolResults: ToolResultInfo[];
  isStreaming: boolean;
}

export function MessageBubble({
  content,
  toolResults,
  isStreaming,
}: MessageBubbleProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className="flex gap-3">
      {/* AI 头像 */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dim)] flex items-center justify-center mt-0.5">
        <span className="text-[var(--bg-primary)] font-bold text-xs font-[var(--font-mono)]">
          AI
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {/* 工具结果渲染 */}
        {toolResults.length > 0 && (
          <div className="mb-3 space-y-3">
            {toolResults.map((result, idx) => (
              <ToolResultCard key={idx} result={result} />
            ))}
          </div>
        )}

        {/* Markdown 内容 */}
        <div className="markdown-body">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : isStreaming ? (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>正在分析...</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** 工具结果卡片 */
function ToolResultCard({ result }: { result: ToolResultInfo }) {
  if (result.error) {
    return (
      <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
        ⚠️ 工具 {result.name} 调用失败: {result.error}
      </div>
    );
  }

  // 尝试将数据渲染为表格
  const data = result.data;
  if (!data) return null;

  // 如果是数组且包含对象，渲染为表格
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    return (
      <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
        <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)] text-xs text-[var(--accent-gold)] font-medium">
          📊 {getToolLabel(result.name)}
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--bg-secondary)]">
                {Object.keys(data[0] as Record<string, unknown>).map((key) => (
                  <th
                    key={key}
                    className="px-3 py-2 text-left text-[var(--text-secondary)] font-medium whitespace-nowrap border-b border-[var(--border-secondary)]"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-[var(--border-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  {Object.values(row as Record<string, unknown>).map((val, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-3 py-2 text-[var(--text-primary)] whitespace-nowrap"
                    >
                      {formatCellValue(val, String(Object.keys(data[0] as Record<string, unknown>)[colIdx]))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > 20 && (
          <div className="px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]">
            仅显示前 20 条，共 {data.length} 条数据
          </div>
        )}
      </div>
    );
  }

  // 如果是对象，渲染为键值对
  if (typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
        <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)] text-xs text-[var(--accent-gold)] font-medium">
          📊 {getToolLabel(result.name)}
        </div>
        <div className="p-3 space-y-1.5 max-h-60 overflow-y-auto">
          {entries.map(([key, val]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">{key}</span>
              <span className="text-[var(--text-primary)] font-medium font-[var(--font-mono)]">
                {formatCellValue(val, key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 其他类型，渲染为文本
  return (
    <div className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)]">
      📊 {getToolLabel(result.name)}: {String(data)}
    </div>
  );
}

/** 获取工具标签 */
function getToolLabel(name: string): string {
  const labels: Record<string, string> = {
    lhb_aborttrade_market_date_get: "龙虎榜个股列表",
    lhb_aborttrade_market_code_date_get: "龙虎榜明细",
    lhb_aborttrade_stock_market_code_get: "个股龙虎榜记录",
    lhb_stat_stock_months_get: "龙虎榜排行",
    lhb_stat_stock_market_code_months_get: "个股龙虎榜统计",
    lhb_stat_dept_id_months_get: "营业部统计",
    lhb_outline_plate_get: "龙虎榜概括",
    lhb_calendar_market_month_get: "龙虎榜日历",
    lhb_aborttrade_batchstock_post: "批量龙虎榜查询",
    commonBasic: "基本指标",
    commonIndicator: "指标对比",
    commonIndustryInfo: "行业信息",
    commonIndustryTop2: "行业前二",
    commonReportType: "报告期",
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
  return labels[name] || name;
}

/** 格式化单元格值 */
function formatCellValue(value: unknown, columnKey: string): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    // 百分比类字段
    if (columnKey.toLowerCase().includes("rate") || columnKey.toLowerCase().includes("ratio") || columnKey.includes("率") || columnKey.includes("比")) {
      return `${value.toFixed(2)}%`;
    }
    // 大数字
    if (Math.abs(value) >= 10000) {
      return value.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
    }
    return value.toLocaleString("zh-CN", { maximumFractionDigits: 4 });
  }
  return String(value);
}
