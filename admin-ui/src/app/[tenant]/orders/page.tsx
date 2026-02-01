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

function filterOrdersByPrice(orders: OrderListItem[], priceMin: string | undefined, priceMax: string | undefined): OrderListItem[] {
  const min = priceMin ? parseFloat(priceMin) : null;
  const max = priceMax ? parseFloat(priceMax) : null;

  if (min === null && max === null) return orders;

  return orders.filter((order) => {
    if (min !== null && order.total < min) return false;
    if (max !== null && order.total > max) return false;
    return true;
  });
}

function filterOrdersByCustomer(orders: OrderListItem[], customer: string | undefined): OrderListItem[] {
  if (!customer) return orders;

  const searchTerm = customer.toLowerCase().trim();
  if (!searchTerm) return orders;

  return orders.filter((order) =>
    order.customer_name?.toLowerCase().includes(searchTerm)
  );
}

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ status?: string; dateRange?: DateRangeKey; priceMin?: string; priceMax?: string; customer?: string }>;
}) {
  const { tenant } = await params;
  const { status, dateRange, priceMin, priceMax, customer } = await searchParams;

  let orders: OrderListItem[] = [];
  let error: string | null = null;

  try {
    orders = await getOrders(tenant, status ? { status } : undefined);
    orders = filterOrdersByDate(orders, dateRange);
    orders = filterOrdersByPrice(orders, priceMin, priceMax);
    orders = filterOrdersByCustomer(orders, customer);
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
        <OrderFilters
          currentStatus={status || null}
          currentDateRange={dateRange || null}
          currentPriceMin={priceMin || null}
          currentPriceMax={priceMax || null}
          currentCustomer={customer || null}
        />
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
