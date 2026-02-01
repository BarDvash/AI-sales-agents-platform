"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ConversationDetail as ConversationDetailType, getConversation } from "@/lib/api";
import ConversationDetail from "./ConversationDetail";
import CustomerProfile from "./CustomerProfile";
import CustomerOrders from "./CustomerOrders";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

interface ConversationViewProps {
  tenant: string;
}

export default function ConversationView({ tenant }: ConversationViewProps) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");
  const t = useTranslations();

  const [conversation, setConversation] = useState<ConversationDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!selectedId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getConversation(tenant, parseInt(selectedId));
      setConversation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error.loadConversation"));
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [selectedId, tenant, t]);

  useEffect(() => {
    if (!selectedId) {
      setConversation(null);
      return;
    }
    loadConversation();
  }, [selectedId, loadConversation]);

  // No conversation selected
  if (!selectedId) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon="messages"
          title={t("conversations.selectPrompt.title")}
          description={t("conversations.selectPrompt.description")}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text={t("common.loading")} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState
          title={t("error.loadConversation")}
          message={error}
          onRetry={loadConversation}
        />
      </div>
    );
  }

  // No data
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon="conversations"
          title={t("conversations.notFound.title")}
          description={t("conversations.notFound.description")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Message thread */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-medium text-slate-900">
            {conversation.customer?.name || conversation.chat_id}
          </h3>
          <p className="text-sm text-slate-500">
            {t("conversations.messages", { count: conversation.messages.length })}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ConversationDetail messages={conversation.messages} />
        </div>
      </div>

      {/* Sidebar - Profile & Orders */}
      <div className="w-64 border-s border-slate-200/60 bg-slate-50/30 overflow-y-auto">
        <CustomerProfile customer={conversation.customer} />
        <div className="border-t border-slate-100">
          <CustomerOrders orders={conversation.orders} />
        </div>
      </div>
    </div>
  );
}
