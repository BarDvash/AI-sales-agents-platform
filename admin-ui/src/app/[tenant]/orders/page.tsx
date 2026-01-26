import { Suspense } from "react";
import { getOrders, OrderListItem } from "@/lib/api";
import OrdersTable from "@/components/OrdersTable";
import OrderFilters from "@/components/OrderFilters";

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
          {status ? ` (${status})` : ""}
        </p>
      </div>

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
