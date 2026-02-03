"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageToggle from "@/components/LanguageToggle";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params.tenant as string;
  const t = useTranslations("nav");

  // Format tenant name for display
  const tenantDisplay = tenant
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const isConversationsActive = pathname.includes("/conversations");
  const isOrdersActive = pathname.includes("/orders");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand + Tenant */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {t("brand")}
              </h1>
              <span className="text-slate-300">·</span>
              <span className="text-lg font-medium text-slate-600">
                {tenantDisplay}
              </span>
            </div>

            {/* Navigation Tabs + Language Toggle */}
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link
                  href={`/${tenant}/conversations`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                    isConversationsActive
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {t("conversations")}
                </Link>
                <Link
                  href={`/${tenant}/orders`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                    isOrdersActive
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {t("orders")}
                </Link>
              </nav>

              {/* Language Toggle */}
              <div className="border-s border-slate-200 ps-4">
                <LanguageToggle />
              </div>
            </div>
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
