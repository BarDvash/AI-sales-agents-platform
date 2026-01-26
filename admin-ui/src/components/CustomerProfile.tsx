"use client";

import { CustomerInfo } from "@/lib/api";

interface CustomerProfileProps {
  customer: CustomerInfo | null;
}

export default function CustomerProfile({ customer }: CustomerProfileProps) {
  if (!customer) {
    return (
      <div className="p-4 text-slate-500 text-sm">No customer information</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Customer Profile</h3>

      <div className="space-y-2 text-sm">
        {customer.name && (
          <div>
            <span className="text-slate-500">Name:</span>
            <span className="ml-2 text-slate-800">{customer.name}</span>
          </div>
        )}

        {customer.address && (
          <div>
            <span className="text-slate-500">Address:</span>
            <span className="ml-2 text-slate-800" dir="auto">
              {customer.address}
            </span>
          </div>
        )}

        {customer.language && (
          <div>
            <span className="text-slate-500">Language:</span>
            <span className="ml-2 text-slate-800">{customer.language}</span>
          </div>
        )}

        {customer.notes && (
          <div>
            <span className="text-slate-500">Notes:</span>
            <p className="mt-1 text-slate-700 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100" dir="auto">
              {customer.notes}
            </p>
          </div>
        )}

        {!customer.name &&
          !customer.address &&
          !customer.language &&
          !customer.notes && (
            <p className="text-slate-400 italic">No profile information yet</p>
          )}
      </div>
    </div>
  );
}
