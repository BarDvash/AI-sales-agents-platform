"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderListItem } from "@/lib/api";
import EmptyState from "./EmptyState";

interface OrdersTableProps {
  orders: OrderListItem[];
}

function formatCurrency(amount: number): string {
  return `₪${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function formatItems(items: OrderListItem["items"]): string {
  const summary = items
    .slice(0, 2)
    .map((item) => `${item.quantity} ${item.product_name}`)
    .join(", ");

  if (items.length > 2) {
    return `${summary} +${items.length - 2} more`;
  }
  return summary;
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const params = useParams();
  const tenant = params.tenant as string;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="orders"
        title="No orders found"
        description="Orders will appear here when customers place orders through the AI agent."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/70">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-slate-50/70 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/${tenant}/orders/${order.id}`}
                  className="text-sm font-mono text-indigo-600 hover:text-indigo-700"
                >
                  {order.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">
                  {order.customer_name || `Customer #${order.customer_id}`}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600 truncate max-w-xs block" dir="auto">
                  {formatItems(order.items)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(order.total)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-500">
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
