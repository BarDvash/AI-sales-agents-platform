"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params.tenant as string;

  // Format tenant name for display
  const tenantDisplay = tenant
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const isConversationsActive = pathname.includes("/conversations");
  const isOrdersActive = pathname.includes("/orders");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Tenant Name */}
            <h1 className="text-xl font-semibold text-gray-900">
              {tenantDisplay}
            </h1>

            {/* Navigation Tabs */}
            <nav className="flex space-x-4">
              <Link
                href={`/${tenant}/conversations`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isConversationsActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Conversations
              </Link>
              <Link
                href={`/${tenant}/orders`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isOrdersActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
