"use client";

import { useState, useEffect } from "react";
import { fetchChartData } from "@/lib/api";
import type { ChartDataPoint } from "@/lib/mock-data";

const COLORS = {
  courses: "#E74C3C",
  events: "#36B5A0",
  scholarships: "#1A5C57",
};

type Period = "3months" | "30days" | "7days";

export default function BarChart() {
  const [period, setPeriod] = useState<Period>("3months");
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    fetchChartData(period).then(setData);
  }, [period]);

  const maxValue = 28;
  const gridLines = [0, 7, 14, 21, 28];

  const svgWidth = 960;
  const leftPad = 36;
  const rightPad = 6;
  const chartHeight = 360;
  const chartTop = 10;
  const chartBottom = chartTop + chartHeight;

  const usableWidth = svgWidth - leftPad - rightPad;
  const n = data.length || 1;
  const groupGap = usableWidth * 0.04;
  const groupWidth = (usableWidth - groupGap * (n - 1)) / n;
  const barGap = 3;
  const barWidth = (groupWidth - barGap * 2) / 3;

  const getY = (val: number) => chartTop + chartHeight - (val / maxValue) * chartHeight;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900">New Opportunities</p>
          <p className="text-sm text-gray-500">Total for the last 3 months</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
          {([
            ["3months", "Last 3 months"],
            ["30days", "Last 30 days"],
            ["7days", "Last 7 days"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                period === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div>
        <svg
          viewBox={`0 0 ${svgWidth} ${chartBottom + 40}`}
          className="h-120 w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis grid lines and labels */}
          {gridLines.map((val) => (
            <g key={val}>
              <line
                x1={leftPad}
                y1={getY(val)}
                x2={svgWidth - rightPad}
                y2={getY(val)}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray={val === 0 ? "0" : "4,4"}
              />
              <text
                x="34"
                y={getY(val) + 4}
                fontSize="12"
                fill="#9ca3af"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((point, i) => {
            const barsWidth = barWidth * 3 + barGap * 2;
            const groupX = leftPad + i * (groupWidth + groupGap) + (groupWidth - barsWidth) / 2;
            return (
              <g key={point.month}>
                {/* Courses */}
                <rect
                  x={groupX}
                  y={getY(point.courses)}
                  width={barWidth}
                  height={chartBottom - getY(point.courses)}
                  fill={COLORS.courses}
                  rx="3"
                />
                {/* Events */}
                <rect
                  x={groupX + barWidth + barGap}
                  y={getY(point.events)}
                  width={barWidth}
                  height={chartBottom - getY(point.events)}
                  fill={COLORS.events}
                  rx="3"
                />
                {/* Scholarships */}
                <rect
                  x={groupX + (barWidth + barGap) * 2}
                  y={getY(point.scholarships)}
                  width={barWidth}
                  height={chartBottom - getY(point.scholarships)}
                  fill={COLORS.scholarships}
                  rx="3"
                />
                {/* Month label */}
                <text
                  x={leftPad + i * (groupWidth + groupGap) + groupWidth / 2}
                  y={chartBottom + 24}
                  fontSize="13"
                  fill="#9ca3af"
                  textAnchor="middle"
                >
                  {point.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.courses }} />
          <span className="text-sm text-gray-600">Courses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.events }} />
          <span className="text-sm text-gray-600">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.scholarships }} />
          <span className="text-sm text-gray-600">Scholarships</span>
        </div>
      </div>
    </section>
  );
}
