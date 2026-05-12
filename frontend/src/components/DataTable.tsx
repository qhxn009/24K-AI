"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatNumber, getPriceColorClass } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  format?: "number" | "percent" | "price" | "text";
  width?: string;
}

interface DataTableProps {
  title?: string;
  columns?: Column[];
  data: Record<string, unknown>[] | unknown;
  maxHeight?: string;
}

const DEFAULT_PAGE_SIZE = 10;

export function DataTable({
  title,
  columns: propColumns,
  data,
  maxHeight = "320px",
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // 标准化数据
  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    return [];
  }, [data]);

  // 自动推断列
  const columns = useMemo<Column[]>(() => {
    if (propColumns && propColumns.length > 0) return propColumns;
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((key) => ({
      key,
      label: key,
      sortable: true,
      format: inferFormat(key, rows[0][key]),
    }));
  }, [propColumns, rows]);

  // 排序
  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const na = typeof va === "number" ? va : parseFloat(String(va)) || 0;
      const nb = typeof vb === "number" ? vb : parseFloat(String(vb)) || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    });
  }, [rows, sortKey, sortDir]);

  // 分页
  const totalPages = Math.ceil(sortedRows.length / DEFAULT_PAGE_SIZE);
  const pagedRows = sortedRows.slice(
    page * DEFAULT_PAGE_SIZE,
    (page + 1) * DEFAULT_PAGE_SIZE
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
      {title && (
        <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)] text-xs text-[var(--accent-gold)] font-medium flex items-center justify-between">
          <span>📊 {title}</span>
          <span className="text-[var(--text-muted)]">
            共 {sortedRows.length} 条
          </span>
        </div>
      )}
      <div className="overflow-x-auto" style={{ maxHeight }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-secondary)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2 text-left text-[var(--text-secondary)] font-medium whitespace-nowrap border-b border-[var(--border-primary)]",
                    col.sortable !== false && "cursor-pointer select-none hover:text-[var(--accent-gold)]"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <ArrowUpDown
                        size={10}
                        className={sortKey === col.key ? "text-[var(--accent-gold)]" : "opacity-30"}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-[var(--border-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2 whitespace-nowrap",
                      col.format === "price" && getPriceColorClass(Number(row[col.key]) || 0)
                    )}
                  >
                    <span className="font-[var(--font-mono)]">
                      {formatCell(row[col.key], col.format)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
          <span className="text-[10px] text-[var(--text-muted)]">
            第 {page + 1} / {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-[var(--bg-hover)] disabled:opacity-30 text-[var(--text-secondary)]"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-[var(--bg-hover)] disabled:opacity-30 text-[var(--text-secondary)]"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** 推断列格式 */
function inferFormat(
  key: string,
  value: unknown
): "number" | "percent" | "price" | "text" {
  const k = key.toLowerCase();
  if (
    k.includes("涨") ||
    k.includes("跌") ||
    k.includes("change") ||
    k.includes("rate") ||
    k.includes("ratio") ||
    k.includes("率") ||
    k.includes("比")
  ) {
    return "percent";
  }
  if (k.includes("price") || k.includes("价") || k.includes("额") || k.includes("amount")) {
    return "price";
  }
  if (typeof value === "number") return "number";
  return "text";
}

/** 格式化单元格 */
function formatCell(
  value: unknown,
  format?: "number" | "percent" | "price" | "text"
): string {
  if (value === null || value === undefined) return "-";
  const str = String(value);

  switch (format) {
    case "number":
      return formatNumber(str);
    case "percent": {
      const n = parseFloat(str);
      if (isNaN(n)) return str;
      return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
    }
    case "price":
      return formatNumber(str);
    default:
      return str;
  }
}
