"use client";

import { useTranslations } from "next-intl";

interface OrdersHeaderProps {
  count: number;
  status?: string | null;
}

export default function OrdersHeader({ count, status }: OrdersHeaderProps) {
  const t = useTranslations();

  const statusLabel = status ? t(`status.${status}`) : null;

  return (
    <div
      className="px-6 py-4 border-b"
      style={{ borderColor: "var(--border-secondary)" }}
    >
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {t("orders.title")}
      </h2>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        {count} {count === 1 ? t("orders.table.orderId").toLowerCase() : t("orders.title").toLowerCase()}
        {statusLabel ? ` (${statusLabel})` : ""}
      </p>
    </div>
  );
}
