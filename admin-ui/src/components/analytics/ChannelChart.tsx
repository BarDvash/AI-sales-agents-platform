"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChannelChartProps {
  data: Record<string, number>;
}

const CHANNEL_COLORS: Record<string, string> = {
  telegram: "#8774e1", // Telegram purple
  whatsapp: "#00a884", // WhatsApp green
};

const CHANNEL_LABELS: Record<string, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

export default function ChannelChart({ data }: ChannelChartProps) {
  const t = useTranslations();

  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([channel, count]) => ({
      name: CHANNEL_LABELS[channel] || channel,
      value: count,
      channel,
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
              fill={CHANNEL_COLORS[entry.channel] || "#6b7280"}
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
