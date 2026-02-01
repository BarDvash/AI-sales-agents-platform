"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { OrderSummary } from "@/lib/api";
import { useLocale } from "@/i18n/client";

interface CustomerOrdersProps {
  orders: OrderSummary[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
    case "completed":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20";
  }
}

export default function CustomerOrders({ orders }: CustomerOrdersProps) {
  const params = useParams();
  const tenant = params.tenant as string;
  const t = useTranslations();
  const { locale } = useLocale();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <div className="p-4 text-slate-500 text-sm">{t("customer.noOrders")}</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
        {t("customer.orders")}
      </h3>

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${tenant}/orders?selected=${order.id}`}
            className="block p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-slate-700">
                #{order.id.split("-").pop()}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {t(`status.${order.status}`)}
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {formatCurrency(order.total)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
