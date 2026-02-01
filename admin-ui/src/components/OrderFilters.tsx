"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";

interface OrderFiltersProps {
  currentStatus: string | null;
  currentDateRange: string | null;
}

const STATUS_KEYS = ["", "pending", "confirmed", "completed", "cancelled"];
const DATE_RANGE_KEYS = ["", "today", "last7Days", "last30Days", "thisMonth"];

export default function OrderFilters({ currentStatus, currentDateRange }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleStatusChange = (status: string) => updateParams("status", status);
  const handleDateRangeChange = (dateRange: string) => updateParams("dateRange", dateRange);

  const getStatusLabel = (value: string): string => {
    if (value === "") return t("filters.allStatuses");
    return t(`status.${value}`);
  };

  const getDateRangeLabel = (value: string): string => {
    if (value === "") return t("filters.allDates");
    return t(`filters.${value}`);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex-wrap">
      <label className="text-sm font-medium text-slate-600">
        {t("filters.filterBy")}
      </label>

      <select
        value={currentStatus || ""}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        {STATUS_KEYS.map((value) => (
          <option key={value} value={value}>
            {getStatusLabel(value)}
          </option>
        ))}
      </select>

      <select
        value={currentDateRange || ""}
        onChange={(e) => handleDateRangeChange(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        {DATE_RANGE_KEYS.map((value) => (
          <option key={value} value={value}>
            {getDateRangeLabel(value)}
          </option>
        ))}
      </select>
    </div>
  );
}
