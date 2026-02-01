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
    <div className="px-6 py-4 border-b border-slate-100">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
        {t("orders.title")}
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        {count} {count === 1 ? t("orders.table.orderId").toLowerCase() : t("orders.title").toLowerCase()}
        {statusLabel ? ` (${statusLabel})` : ""}
      </p>
    </div>
  );
}
