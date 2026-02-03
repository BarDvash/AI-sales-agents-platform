"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { OrderListItem } from "@/lib/api";
import { useLocale } from "@/i18n/client";
import EmptyState from "./EmptyState";

interface OrdersTableProps {
  orders: OrderListItem[];
}

type SortField = "id" | "customer" | "status" | "total" | "date";
type SortDirection = "asc" | "desc";

function getStatusStyles(status: string): React.CSSProperties {
  switch (status) {
    case "pending":
      return {
        backgroundColor: "var(--status-pending-bg)",
        color: "var(--status-pending-text)",
      };
    case "confirmed":
      return {
        backgroundColor: "var(--status-confirmed-bg)",
        color: "var(--status-confirmed-text)",
      };
    case "completed":
      return {
        backgroundColor: "var(--status-completed-bg)",
        color: "var(--status-completed-text)",
      };
    case "cancelled":
      return {
        backgroundColor: "var(--status-cancelled-bg)",
        color: "var(--status-cancelled-text)",
      };
    default:
      return {
        backgroundColor: "var(--bg-tertiary)",
        color: "var(--text-muted)",
      };
  }
}

function SortIcon({ field, currentField, direction }: { field: SortField; currentField: SortField | null; direction: SortDirection }) {
  const isActive = field === currentField;

  return (
    <span className="ms-1 inline-flex flex-col">
      <svg
        className="w-2 h-2 -mb-0.5"
        style={{ color: isActive && direction === "asc" ? "var(--text-secondary)" : "var(--text-faint)" }}
        viewBox="0 0 8 5"
        fill="currentColor"
      >
        <path d="M4 0L8 5H0L4 0Z" />
      </svg>
      <svg
        className="w-2 h-2"
        style={{ color: isActive && direction === "desc" ? "var(--text-secondary)" : "var(--text-faint)" }}
        viewBox="0 0 8 5"
        fill="currentColor"
      >
        <path d="M4 5L0 0H8L4 5Z" />
      </svg>
    </span>
  );
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const params = useParams();
  const tenant = params.tenant as string;
  const t = useTranslations();
  const { locale } = useLocale();

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOrders = useMemo(() => {
    if (!sortField) return orders;

    return [...orders].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "customer":
          const nameA = a.customer_name || "";
          const nameB = b.customer_name || "";
          comparison = nameA.localeCompare(nameB);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [orders, sortField, sortDirection]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatItems = (items: OrderListItem["items"]): string => {
    const summary = items
      .slice(0, 2)
      .map((item) => `${item.quantity} ${item.product_name}`)
      .join(", ");

    if (items.length > 2) {
      return `${summary} ${t("orders.moreItems", { count: items.length - 2 })}`;
    }
    return summary;
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="orders"
        title={t("orders.empty.title")}
        description={t("orders.empty.description")}
      />
    );
  }

  const headerStyle = {
    color: "var(--text-muted)",
  };

  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-full"
        style={{ borderColor: "var(--border-secondary)" }}
      >
        <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
          <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
            <th
              className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors select-none"
              style={headerStyle}
              onClick={() => handleSort("id")}
            >
              <span className="inline-flex items-center">
                {t("orders.table.orderId")}
                <SortIcon field="id" currentField={sortField} direction={sortDirection} />
              </span>
            </th>
            <th
              className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors select-none"
              style={headerStyle}
              onClick={() => handleSort("customer")}
            >
              <span className="inline-flex items-center">
                {t("orders.table.customer")}
                <SortIcon field="customer" currentField={sortField} direction={sortDirection} />
              </span>
            </th>
            <th
              className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
              style={headerStyle}
            >
              {t("orders.table.items")}
            </th>
            <th
              className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors select-none"
              style={headerStyle}
              onClick={() => handleSort("status")}
            >
              <span className="inline-flex items-center">
                {t("orders.table.status")}
                <SortIcon field="status" currentField={sortField} direction={sortDirection} />
              </span>
            </th>
            <th
              className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors select-none"
              style={headerStyle}
              onClick={() => handleSort("total")}
            >
              <span className="inline-flex items-center justify-end">
                {t("orders.table.total")}
                <SortIcon field="total" currentField={sortField} direction={sortDirection} />
              </span>
            </th>
            <th
              className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors select-none"
              style={headerStyle}
              onClick={() => handleSort("date")}
            >
              <span className="inline-flex items-center">
                {t("orders.table.date")}
                <SortIcon field="date" currentField={sortField} direction={sortDirection} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--bg-primary)" }}>
          {sortedOrders.map((order, index) => (
            <tr
              key={order.id}
              className="cursor-pointer transition-colors"
              style={{
                borderBottom: index < sortedOrders.length - 1 ? "1px solid var(--border-secondary)" : undefined,
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/${tenant}/orders/${order.id}`}
                  className="text-sm font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {order.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {order.customer_name || `Customer #${order.customer_id}`}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className="text-sm truncate max-w-xs block"
                  style={{ color: "var(--text-muted)" }}
                  dir="auto"
                >
                  {formatItems(order.items)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  style={getStatusStyles(order.status)}
                >
                  {t(`status.${order.status}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-end">
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {formatCurrency(order.total)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm" style={{ color: "var(--text-faint)" }}>
                  {formatDate(order.created_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
