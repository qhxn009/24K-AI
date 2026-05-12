"use client";

import { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts/core";
import { LineChart, PieChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ChartType } from "@/lib/types";

// 注册 ECharts 组件
echarts.use([
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

interface FinanceChartProps {
  type: ChartType;
  title?: string;
  data: {
    xAxis?: string[];
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
    legend?: string[];
  };
  height?: number;
}

export function FinanceChart({
  type,
  title,
  data,
  height = 300,
}: FinanceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  const option = useMemo(() => {
    // 通用深色主题配置
    const baseTheme = {
      backgroundColor: "transparent",
      textStyle: { color: "#8899aa", fontFamily: "JetBrains Mono, monospace" },
      tooltip: {
        backgroundColor: "#1a2332",
        borderColor: "#2a3548",
        textStyle: { color: "#e2e8f0", fontSize: 12 },
        trigger: type === "pie" ? "item" : "axis",
      },
      legend: {
        textStyle: { color: "#8899aa", fontSize: 11 },
        top: 0,
      },
    };

    if (type === "line") {
      return {
        ...baseTheme,
        title: title
          ? {
              text: title,
              textStyle: { color: "#e2e8f0", fontSize: 13, fontWeight: 600 },
              left: "center",
              top: 0,
            }
          : undefined,
        grid: { left: 60, right: 30, top: title ? 40 : 30, bottom: 30 },
        xAxis: {
          type: "category",
          data: data.xAxis || [],
          axisLine: { lineStyle: { color: "#2a3548" } },
          axisLabel: { color: "#5a6a7a", fontSize: 10 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#1e2d3d" } },
          axisLabel: { color: "#5a6a7a", fontSize: 10 },
        },
        series: data.series.map((s) => ({
          name: s.name,
          type: "line",
          data: s.data,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2, color: s.color || "#f0b90b" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: (s.color || "#f0b90b") + "33" },
              { offset: 1, color: (s.color || "#f0b90b") + "05" },
            ]),
          },
        })),
      };
    }

    if (type === "pie") {
      const colors = [
        "#f0b90b",
        "#ef4444",
        "#22c55e",
        "#3b82f6",
        "#a855f7",
        "#f97316",
        "#06b6d4",
        "#ec4899",
      ];
      return {
        ...baseTheme,
        title: title
          ? {
              text: title,
              textStyle: { color: "#e2e8f0", fontSize: 13, fontWeight: 600 },
              left: "center",
              top: 0,
            }
          : undefined,
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: ["50%", title ? "55%" : "50%"],
            avoidLabelOverlap: true,
            itemStyle: {
              borderColor: "#0a0e17",
              borderWidth: 2,
              borderRadius: 4,
            },
            label: {
              color: "#8899aa",
              fontSize: 11,
              formatter: "{b}: {d}%",
            },
            data: data.series[0]?.data.map((val, idx) => ({
              name: (data.legend && data.legend[idx]) || `项目${idx + 1}`,
              value: val,
              itemStyle: { color: colors[idx % colors.length] },
            })),
          },
        ],
      };
    }

    if (type === "bar") {
      return {
        ...baseTheme,
        title: title
          ? {
              text: title,
              textStyle: { color: "#e2e8f0", fontSize: 13, fontWeight: 600 },
              left: "center",
              top: 0,
            }
          : undefined,
        grid: { left: 60, right: 30, top: title ? 40 : 30, bottom: 30 },
        xAxis: {
          type: "category",
          data: data.xAxis || [],
          axisLine: { lineStyle: { color: "#2a3548" } },
          axisLabel: {
            color: "#5a6a7a",
            fontSize: 10,
            rotate: data.xAxis && data.xAxis.length > 8 ? 30 : 0,
          },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#1e2d3d" } },
          axisLabel: { color: "#5a6a7a", fontSize: 10 },
        },
        series: data.series.map((s) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          barMaxWidth: 30,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: s.color || "#f0b90b" },
              { offset: 1, color: (s.color || "#f0b90b") + "44" },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        })),
      };
    }

    return {};
  }, [type, title, data]);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化或获取实例
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    instanceRef.current.setOption(option, true);

    // 响应式
    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [option]);

  // 清理
  useEffect(() => {
    return () => {
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
      <div
        ref={chartRef}
        style={{ width: "100%", height: `${height}px` }}
      />
    </div>
  );
}
