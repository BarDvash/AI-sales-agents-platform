"use client";

import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TopProduct } from "@/lib/api";

interface TopProductsChartProps {
  products: TopProduct[];
}

export default function TopProductsChart({ products }: TopProductsChartProps) {
  const t = useTranslations();

  if (products.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48"
        style={{ color: "var(--text-muted)" }}
      >
        {t("analytics.noData")}
      </div>
    );
  }

  // Take top 5
  const topProducts = products.slice(0, 5);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={topProducts}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="var(--text-muted)"
          fontSize={11}
          width={120}
          tickFormatter={(value) =>
            value.length > 18 ? `${value.slice(0, 18)}...` : value
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "8px",
            color: "var(--text-primary)",
          }}
          formatter={(value) => [value, t("analytics.ordersUnit")]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {topProducts.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#2ecc71" : "var(--brand-primary-muted, #95d5b2)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
