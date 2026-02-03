"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ConversationListItem, getChannelColors } from "@/lib/api";
import { useLocale } from "@/i18n/client";
import EmptyState from "./EmptyState";

// Channel badge component using shared color config
function ChannelBadge({ channel }: { channel: string }) {
  const colors = getChannelColors(channel);
  const labels: Record<string, string> = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
  };

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        backgroundColor: colors.badgeBgColor,
        color: colors.badgeTextColor,
      }}
    >
      {labels[channel] || channel}
    </span>
  );
}

interface ConversationListProps {
  conversations: ConversationListItem[];
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default function ConversationList({
  conversations,
}: ConversationListProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = params.tenant as string;
  const selectedId = searchParams.get("selected");
  const t = useTranslations();
  const { locale } = useLocale();

  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t("time.justNow");
    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("time.daysAgo", { count: diffDays });

    return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB");
  };

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon="conversations"
        title={t("conversations.empty.title")}
        description={t("conversations.empty.description")}
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => {
        const isSelected = selectedId === conv.id.toString();
        const colors = getChannelColors(conv.channel);

        return (
          <Link
            key={conv.id}
            href={`/${tenant}/conversations?selected=${conv.id}`}
            className={`block p-4 transition-all duration-150 ${
              isSelected ? "border-s-2" : "hover:bg-slate-50"
            }`}
            style={
              isSelected
                ? {
                    backgroundColor: colors.activeBgColor,
                    borderColor: colors.activeBorderColor,
                  }
                : undefined
            }
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                {/* Customer name */}
                <p className="text-sm font-medium text-slate-900 truncate">
                  {conv.customer_name || (
                    <span className="text-slate-400 italic">{t("customer.noName")}</span>
                  )}
                </p>

                {/* Chat ID (always shown as subtitle) */}
                <p className="text-xs text-slate-400 font-mono">
                  #{conv.chat_id}
                </p>

                {/* Last message preview */}
                <p className="mt-1 text-sm text-slate-500 truncate" dir="auto">
                  {truncateText(conv.last_message, 50)}
                </p>
              </div>

              {/* Channel badge, timestamp and message count */}
              <div className="ms-4 flex-shrink-0 text-end">
                <ChannelBadge channel={conv.channel} />
                <p className="text-xs text-slate-400 mt-1">
                  {formatRelativeTime(conv.last_message_at)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t("conversations.msgCount", { count: conv.message_count })}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
