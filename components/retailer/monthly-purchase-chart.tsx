/**
 * @file components/retailer/monthly-purchase-chart.tsx
 * @description 월별 구매 추이 차트 컴포넌트
 *
 * 소매점 사용자의 월별 구매 금액 추이를 시각화하는 차트입니다.
 *
 * @dependencies
 * - recharts: 차트 라이브러리
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyPurchaseData {
  month: string;
  amount: number;
}

interface MonthlyPurchaseChartProps {
  data: MonthlyPurchaseData[];
}

export default function MonthlyPurchaseChart({
  data,
}: MonthlyPurchaseChartProps) {
  return (
    <div className="h-full w-full">
      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        월별 구매 추이
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: "currentColor" }}
            tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#111827",
            }}
            formatter={(value: number) => [`${value.toLocaleString()}원`, "구매 금액"]}
            labelStyle={{ color: "#111827", fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

