"use client";

import { CustomerInfo } from "@/lib/api";

interface CustomerProfileProps {
  customer: CustomerInfo | null;
}

export default function CustomerProfile({ customer }: CustomerProfileProps) {
  if (!customer) {
    return (
      <div className="p-4 text-gray-500 text-sm">No customer information</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-medium text-gray-900">Customer Profile</h3>

      <div className="space-y-2 text-sm">
        {customer.name && (
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900">{customer.name}</span>
          </div>
        )}

        {customer.address && (
          <div>
            <span className="text-gray-500">Address:</span>
            <span className="ml-2 text-gray-900" dir="auto">
              {customer.address}
            </span>
          </div>
        )}

        {customer.language && (
          <div>
            <span className="text-gray-500">Language:</span>
            <span className="ml-2 text-gray-900">{customer.language}</span>
          </div>
        )}

        {customer.notes && (
          <div>
            <span className="text-gray-500">Notes:</span>
            <p className="mt-1 text-gray-900 text-xs bg-gray-50 p-2 rounded" dir="auto">
              {customer.notes}
            </p>
          </div>
        )}

        {!customer.name &&
          !customer.address &&
          !customer.language &&
          !customer.notes && (
            <p className="text-gray-400 italic">No profile information yet</p>
          )}
      </div>
    </div>
  );
}
