"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";

interface OrderFiltersProps {
  currentStatus: string | null;
}

const STATUS_KEYS = ["", "pending", "confirmed", "completed", "cancelled"];

export default function OrderFilters({ currentStatus }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const handleStatusChange = useCallback(
    (status: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const getStatusLabel = (value: string): string => {
    if (value === "") return t("filters.allStatuses");
    return t(`status.${value}`);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-50/50 border-b border-slate-100">
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
    </div>
  );
}
