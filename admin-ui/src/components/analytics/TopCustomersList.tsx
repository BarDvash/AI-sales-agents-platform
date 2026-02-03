"use client";

import { useTranslations } from "next-intl";
import { TopCustomer } from "@/lib/api";
import { useLocale } from "@/i18n/client";

interface TopCustomersListProps {
  customers: TopCustomer[];
  currency?: string;
}

export default function TopCustomersList({
  customers,
  currency = "₪",
}: TopCustomersListProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency: currency === "₪" ? "ILS" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (customers.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32"
        style={{ color: "var(--text-muted)" }}
      >
        {t("analytics.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {customers.map((customer, index) => (
        <div
          key={customer.id}
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium"
              style={{
                backgroundColor:
                  index === 0 ? "#2ecc71" : "var(--bg-secondary)",
                color: index === 0 ? "#0a1f1a" : "var(--text-muted)",
              }}
            >
              {index + 1}
            </span>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {customer.name || t("customer.noName")}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {customer.total_orders} {t("analytics.ordersUnit")}
              </p>
            </div>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {formatCurrency(customer.total_spent)}
          </p>
        </div>
      ))}
    </div>
  );
}
