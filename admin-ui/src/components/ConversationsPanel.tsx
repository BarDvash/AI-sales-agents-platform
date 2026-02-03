"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConversationListItem } from "@/lib/api";
import ConversationList from "./ConversationList";

interface ConversationsPanelProps {
  conversations: ConversationListItem[];
}

type ChannelFilter = "all" | "telegram" | "whatsapp";

export default function ConversationsPanel({
  conversations,
}: ConversationsPanelProps) {
  const t = useTranslations();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");

  // Get unique channels from conversations for dynamic filter options
  const availableChannels = Array.from(
    new Set(conversations.map((c) => c.channel).filter(Boolean))
  );

  // Filter conversations by channel
  const filteredConversations =
    channelFilter === "all"
      ? conversations
      : conversations.filter((c) => c.channel === channelFilter);

  return (
    <>
      {/* Header with title and filter */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {t("conversations.title")}
          </h2>

          {/* Channel filter dropdown */}
          {availableChannels.length > 0 && (
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
              className="text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-muted)",
              }}
            >
              <option value="all">{t("filters.allChannels")}</option>
              {availableChannels.includes("telegram") && (
                <option value="telegram">Telegram</option>
              )}
              {availableChannels.includes("whatsapp") && (
                <option value="whatsapp">WhatsApp</option>
              )}
            </select>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="overflow-y-auto h-[calc(100%-3rem)]">
        <ConversationList conversations={filteredConversations} />
      </div>
    </>
  );
}
