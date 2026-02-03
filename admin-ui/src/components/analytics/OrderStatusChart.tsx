"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OrderStatusChartProps {
  data: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", // amber
  confirmed: "#3b82f6", // blue
  completed: "#22c55e", // green
  cancelled: "#ef4444", // red
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const t = useTranslations();

  const chartData = Object.entries(data).map(([status, count]) => ({
    name: t(`status.${status}`),
    value: count,
    status,
  }));

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48"
        style={{ color: "var(--text-muted)" }}
      >
        {t("analytics.noData")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || "#6b7280"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "8px",
            color: "var(--text-primary)",
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--text-secondary)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
