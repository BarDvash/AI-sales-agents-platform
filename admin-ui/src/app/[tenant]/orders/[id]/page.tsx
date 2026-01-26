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
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_4px_rgb(0_0_0/0.05)] p-8 text-center">
        <p className="text-red-500">{error || "Order not found"}</p>
        <Link
          href={`/${tenant}/orders`}
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_4px_rgb(0_0_0/0.05)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <Link
          href={`/${tenant}/orders`}
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
        >
          ← Back to Orders
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Order {order.id}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Customer: {order.customer_name || `#${order.customer_id}`}
            </p>
            <p className="text-sm text-slate-500">
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
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Items</h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-900" dir="auto">
                    {item.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-center">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/70">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm font-medium text-slate-900 text-right"
                >
                  Total:
                </td>
                <td className="px-4 py-3 text-lg font-semibold text-slate-900 text-right">
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
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Delivery Notes
          </h3>
          <p
            className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100"
            dir="auto"
          >
            {order.delivery_notes}
          </p>
        </div>
      )}
    </div>
  );
}
