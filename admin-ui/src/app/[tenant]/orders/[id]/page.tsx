import Link from "next/link";
import { getOrder } from "@/lib/api";
import OrderDetail from "@/components/OrderDetail";

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

  return <OrderDetail order={order} tenant={tenant} />;
}
