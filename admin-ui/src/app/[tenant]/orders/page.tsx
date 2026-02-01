import { Suspense } from "react";
import { getOrders, OrderListItem } from "@/lib/api";
import OrdersTable from "@/components/OrdersTable";
import OrderFilters from "@/components/OrderFilters";
import OrdersHeader from "@/components/OrdersHeader";

type DateRangeKey = "today" | "last7Days" | "last30Days" | "thisMonth";

function getDateRangeFilter(dateRange: DateRangeKey | undefined): Date | null {
  if (!dateRange) return null;

  const now = new Date();

  switch (dateRange) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "last7Days":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "last30Days":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "thisMonth":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return null;
  }
}

function filterOrdersByDate(orders: OrderListItem[], dateRange: DateRangeKey | undefined): OrderListItem[] {
  const minDate = getDateRangeFilter(dateRange);
  if (!minDate) return orders;

  return orders.filter((order) => new Date(order.created_at) >= minDate);
}

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ status?: string; dateRange?: DateRangeKey }>;
}) {
  const { tenant } = await params;
  const { status, dateRange } = await searchParams;

  let orders: OrderListItem[] = [];
  let error: string | null = null;

  try {
    orders = await getOrders(tenant, status ? { status } : undefined);
    orders = filterOrdersByDate(orders, dateRange);
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
        <OrderFilters currentStatus={status || null} currentDateRange={dateRange || null} />
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
