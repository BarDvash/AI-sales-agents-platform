"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface OrderFiltersProps {
  currentStatus: string | null;
  currentDateRange: string | null;
  currentPriceMin: string | null;
  currentPriceMax: string | null;
  currentCustomer: string | null;
}

const STATUS_KEYS = ["", "pending", "confirmed", "completed", "cancelled"];
const DATE_RANGE_KEYS = ["", "today", "last7Days", "last30Days", "thisMonth"];

export default function OrderFilters({ currentStatus, currentDateRange, currentPriceMin, currentPriceMax, currentCustomer }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const [customerSearch, setCustomerSearch] = useState(currentCustomer || "");
  const [priceMin, setPriceMin] = useState(currentPriceMin || "");
  const [priceMax, setPriceMax] = useState(currentPriceMax || "");

  useEffect(() => {
    setCustomerSearch(currentCustomer || "");
  }, [currentCustomer]);

  useEffect(() => {
    setPriceMin(currentPriceMin || "");
  }, [currentPriceMin]);

  useEffect(() => {
    setPriceMax(currentPriceMax || "");
  }, [currentPriceMax]);

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

  const updateMultipleParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleStatusChange = (status: string) => updateParams("status", status);
  const handleDateRangeChange = (dateRange: string) => updateParams("dateRange", dateRange);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMultipleParams({
      priceMin: priceMin.trim(),
      priceMax: priceMax.trim(),
    });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("customer", customerSearch.trim());
  };

  const handleCustomerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCustomerSearch("");
      updateParams("customer", "");
    }
  };

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

      {/* Price range inputs */}
      <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
        <input
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          placeholder={t("filters.priceMin")}
          min="0"
          className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <span className="text-slate-400">—</span>
        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder={t("filters.priceMax")}
          min="0"
          className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        {(priceMin || priceMax) && (
          <button
            type="button"
            onClick={() => {
              setPriceMin("");
              setPriceMax("");
              updateMultipleParams({ priceMin: "", priceMax: "" });
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Customer name search */}
      <form onSubmit={handleCustomerSubmit} className="relative">
        <svg
          className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <input
          type="text"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          onKeyDown={handleCustomerKeyDown}
          placeholder={t("filters.searchCustomer")}
          className="w-56 ps-9 pe-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        {customerSearch && (
          <button
            type="button"
            onClick={() => {
              setCustomerSearch("");
              updateParams("customer", "");
            }}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
