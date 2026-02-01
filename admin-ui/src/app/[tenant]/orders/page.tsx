import { Suspense } from "react";
import { getOrders, OrderListItem } from "@/lib/api";
import OrdersTable from "@/components/OrdersTable";
import OrderFilters from "@/components/OrderFilters";
import OrdersHeader from "@/components/OrdersHeader";

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { tenant } = await params;
  const { status } = await searchParams;

  let orders: OrderListItem[] = [];
  let error: string | null = null;

  try {
    orders = await getOrders(tenant, status ? { status } : undefined);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load orders";
    orders = [];
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_4px_rgb(0_0_0/0.05)] overflow-hidden">
      {/* Header */}
      <OrdersHeader count={orders.length} status={status} />

      {/* Filters */}
      <Suspense fallback={null}>
        <OrderFilters currentStatus={status || null} />
      </Suspense>

      {/* Table */}
      {error ? (
        <div className="p-4 text-red-500 text-sm">{error}</div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
