"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ConversationListItem } from "@/lib/api";
import EmptyState from "./EmptyState";

interface ConversationListProps {
  conversations: ConversationListItem[];
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
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

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon="conversations"
        title="No conversations yet"
        description="Conversations will appear here when customers start chatting with the AI agent."
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => {
        const isSelected = selectedId === conv.id.toString();

        return (
          <Link
            key={conv.id}
            href={`/${tenant}/conversations?selected=${conv.id}`}
            className={`block p-4 transition-all duration-150 ${
              isSelected
                ? "bg-indigo-50/50 border-l-2 border-indigo-500"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                {/* Customer name or chat_id */}
                <p className="text-sm font-medium text-slate-900 truncate">
                  {conv.customer_name || conv.chat_id}
                </p>

                {/* Last message preview */}
                <p className="mt-1 text-sm text-slate-500 truncate" dir="auto">
                  {truncateText(conv.last_message, 50)}
                </p>
              </div>

              {/* Timestamp and message count */}
              <div className="ml-4 flex-shrink-0 text-right">
                <p className="text-xs text-slate-400">
                  {formatRelativeTime(conv.last_message_at)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {conv.message_count} msgs
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
