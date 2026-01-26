"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderSummary } from "@/lib/api";

interface CustomerOrdersProps {
  orders: OrderSummary[];
}

function formatCurrency(amount: number): string {
  return `₪${amount.toFixed(2)}`;
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

export default function CustomerOrders({ orders }: CustomerOrdersProps) {
  const params = useParams();
  const tenant = params.tenant as string;

  if (orders.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">No orders yet</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-medium text-gray-900">Orders</h3>

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${tenant}/orders?selected=${order.id}`}
            className="block p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-700">
                #{order.id.split("-").pop()}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-900">
              {formatCurrency(order.total)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
