"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

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
      <header
        className="backdrop-blur-sm border-b sticky top-0 z-10"
        style={{
          backgroundColor: "var(--header-bg)",
          borderColor: "var(--header-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand + Tenant */}
            <div className="flex items-center gap-3">
              <h1
                className="text-xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {t("brand")}
              </h1>
              <span style={{ color: "var(--text-faint)" }}>·</span>
              <span
                className="text-lg font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {tenantDisplay}
              </span>
            </div>

            {/* Navigation Tabs + Theme + Language Toggle */}
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link
                  href={`/${tenant}/conversations`}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: isConversationsActive ? "var(--tab-active-bg)" : "transparent",
                    color: isConversationsActive ? "var(--tab-active-text)" : "var(--tab-inactive-text)",
                    ["--tw-ring-color" as string]: "var(--focus-ring)",
                    ["--tw-ring-offset-color" as string]: "var(--bg-primary)",
                  }}
                >
                  {t("conversations")}
                </Link>
                <Link
                  href={`/${tenant}/orders`}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: isOrdersActive ? "var(--tab-active-bg)" : "transparent",
                    color: isOrdersActive ? "var(--tab-active-text)" : "var(--tab-inactive-text)",
                    ["--tw-ring-color" as string]: "var(--focus-ring)",
                    ["--tw-ring-offset-color" as string]: "var(--bg-primary)",
                  }}
                >
                  {t("orders")}
                </Link>
              </nav>

              {/* Theme Toggle */}
              <div
                className="border-s ps-4"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <ThemeToggle />
              </div>

              {/* Language Toggle */}
              <div
                className="border-s ps-4"
                style={{ borderColor: "var(--border-primary)" }}
              >
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
