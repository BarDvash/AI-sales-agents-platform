"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface OrderFiltersProps {
  currentStatus: string | null;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderFilters({ currentStatus }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
      <label className="text-sm text-gray-600">Filter by:</label>

      <select
        value={currentStatus || ""}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
