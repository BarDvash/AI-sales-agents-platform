"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderListItem } from "@/lib/api";

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
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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
      <div className="text-center py-12 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/${tenant}/orders/${order.id}`}
                  className="text-sm font-mono text-blue-600 hover:text-blue-800"
                >
                  {order.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {order.customer_name || `Customer #${order.customer_id}`}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600 truncate max-w-xs block" dir="auto">
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
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">
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
