import Link from "next/link";
import { getOrder } from "@/lib/api";

function formatCurrency(amount: number): string {
  return `₪${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant, id } = await params;

  let order;
  let error: string | null = null;

  try {
    order = await getOrder(tenant, id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load order";
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">{error || "Order not found"}</p>
        <Link
          href={`/${tenant}/orders`}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link
          href={`/${tenant}/orders`}
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Orders
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order {order.id}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Customer: {order.customer_name || `#${order.customer_id}`}
            </p>
            <p className="text-sm text-gray-500">
              Created: {formatDate(order.created_at)}
            </p>
          </div>

          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900" dir="auto">
                    {item.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                >
                  Total:
                </td>
                <td className="px-4 py-3 text-lg font-semibold text-gray-900 text-right">
                  {formatCurrency(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Delivery Notes */}
      {order.delivery_notes && (
        <div className="p-6 pt-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delivery Notes
          </h3>
          <p
            className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg"
            dir="auto"
          >
            {order.delivery_notes}
          </p>
        </div>
      )}
    </div>
  );
}
