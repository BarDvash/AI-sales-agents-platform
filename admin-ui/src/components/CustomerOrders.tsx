"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { OrderSummary, ChannelColors } from "@/lib/api";
import { useLocale } from "@/i18n/client";

interface CustomerOrdersProps {
  orders: OrderSummary[];
  colors?: ChannelColors;
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "pending":
      return { backgroundColor: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" };
    case "confirmed":
      return { backgroundColor: "rgba(52, 211, 153, 0.2)", color: "#34d399" };
    case "completed":
      return { backgroundColor: "rgba(129, 140, 248, 0.2)", color: "#818cf8" };
    case "cancelled":
      return { backgroundColor: "rgba(248, 113, 113, 0.2)", color: "#f87171" };
    default:
      return { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)" };
  }
}

export default function CustomerOrders({ orders, colors }: CustomerOrdersProps) {
  const params = useParams();
  const tenant = params.tenant as string;
  const t = useTranslations();
  const { locale } = useLocale();

  // Dark theme colors based on channel or defaults
  const textColor = "#ffffff";
  const mutedColor = "rgba(255, 255, 255, 0.5)";
  const accentColor = colors?.iconColor || "#8774e1";
  const cardBgColor = "rgba(255, 255, 255, 0.05)";
  const cardHoverBgColor = "rgba(255, 255, 255, 0.1)";
  const borderColor = "rgba(255, 255, 255, 0.1)";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <div className="p-4 text-sm" style={{ color: mutedColor }}>{t("customer.noOrders")}</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {t("customer.orders")}
      </h3>

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${tenant}/orders?selected=${order.id}`}
            className="block p-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = cardHoverBgColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = cardBgColor;
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono" style={{ color: mutedColor }}>
                #{order.id.split("-").pop()}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={getStatusStyle(order.status)}
              >
                {t(`status.${order.status}`)}
              </span>
            </div>
            <div className="mt-1 text-sm" style={{ color: textColor }}>
              {formatCurrency(order.total)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
