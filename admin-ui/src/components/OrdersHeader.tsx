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
      className="px-4 py-3 border-b"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex items-center gap-2">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {t("orders.title")}
        </h2>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {count}{statusLabel ? ` · ${statusLabel}` : ""}
        </span>
      </div>
    </div>
  );
}
