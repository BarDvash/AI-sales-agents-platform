"use client";

import { useTranslations } from "next-intl";
import { CustomerInfo, ChannelColors } from "@/lib/api";

interface CustomerProfileProps {
  customer: CustomerInfo | null;
  colors?: ChannelColors;
}

export default function CustomerProfile({ customer, colors }: CustomerProfileProps) {
  const t = useTranslations("customer");

  // Dark theme colors based on channel or defaults
  const textColor = "#ffffff";
  const mutedColor = "rgba(255, 255, 255, 0.5)";
  const accentColor = colors?.iconColor || "#8774e1";
  const cardBgColor = "rgba(255, 255, 255, 0.05)";
  const borderColor = "rgba(255, 255, 255, 0.1)";

  if (!customer) {
    return (
      <div className="p-4 text-sm" style={{ color: mutedColor }}>{t("noInfo")}</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {t("profile")}
      </h3>

      <div className="space-y-2 text-sm">
        {customer.name && (
          <div>
            <span style={{ color: mutedColor }}>{t("name")}:</span>
            <span className="ms-2" style={{ color: textColor }}>{customer.name}</span>
          </div>
        )}

        {customer.address && (
          <div>
            <span style={{ color: mutedColor }}>{t("address")}:</span>
            <span className="ms-2" style={{ color: textColor }} dir="auto">
              {customer.address}
            </span>
          </div>
        )}

        {customer.language && (
          <div>
            <span style={{ color: mutedColor }}>{t("language")}:</span>
            <span className="ms-2" style={{ color: textColor }}>{customer.language}</span>
          </div>
        )}

        {customer.notes && (
          <div>
            <span style={{ color: mutedColor }}>{t("notes")}:</span>
            <p
              className="mt-1 text-xs p-2.5 rounded-lg"
              style={{
                color: textColor,
                backgroundColor: cardBgColor,
                border: `1px solid ${borderColor}`,
              }}
              dir="auto"
            >
              {customer.notes}
            </p>
          </div>
        )}

        {!customer.name &&
          !customer.address &&
          !customer.language &&
          !customer.notes && (
            <p className="italic" style={{ color: mutedColor }}>{t("noProfile")}</p>
          )}
      </div>
    </div>
  );
}
