"use client";

import { useTranslations } from "next-intl";
import { AnalyticsData } from "@/lib/api";
import { useLocale } from "@/i18n/client";
import StatCard from "@/components/StatCard";
import OrderStatusChart from "./OrderStatusChart";
import TopProductsChart from "./TopProductsChart";
import ChannelChart from "./ChannelChart";
import TopCustomersList from "./TopCustomersList";

interface AnalyticsContentProps {
  analytics: AnalyticsData | null;
  error: string | null;
}

export default function AnalyticsContent({
  analytics,
  error,
}: AnalyticsContentProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div
        className="p-8 text-center rounded-lg border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
          color: "var(--error-text)",
        }}
      >
        {error}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("analytics.title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("analytics.description")}
        </p>
      </div>

      {/* Revenue Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("analytics.revenue.total")}
          value={formatCurrency(analytics.revenue.total)}
        />
        <StatCard
          title={t("analytics.revenue.thisMonth")}
          value={formatCurrency(analytics.revenue.this_month)}
        />
        <StatCard
          title={t("analytics.revenue.thisWeek")}
          value={formatCurrency(analytics.revenue.this_week)}
        />
        <StatCard
          title={t("analytics.revenue.avgOrder")}
          value={formatCurrency(analytics.revenue.avg_order_value)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {t("analytics.orders.byStatus")}
          </h2>
          <OrderStatusChart data={analytics.orders.by_status} />
        </div>

        {/* Channel Distribution */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {t("analytics.channels.title")}
          </h2>
          <ChannelChart data={analytics.conversations.by_channel} />
        </div>
      </div>

      {/* Products and Customers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {t("analytics.products.title")}
          </h2>
          <TopProductsChart products={analytics.top_products} />
        </div>

        {/* Top Customers */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {t("analytics.customers.title")}
            </h2>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
            >
              {analytics.customers.total} {t("analytics.customers.total")}
            </span>
          </div>
          <TopCustomersList customers={analytics.customers.top_customers} />
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t("analytics.orders.total")}
          value={analytics.orders.total}
        />
        <StatCard
          title={t("analytics.conversations.total")}
          value={analytics.conversations.total}
        />
        <StatCard
          title={t("analytics.customers.newThisMonth")}
          value={analytics.customers.new_this_month}
        />
      </div>
    </div>
  );
}
