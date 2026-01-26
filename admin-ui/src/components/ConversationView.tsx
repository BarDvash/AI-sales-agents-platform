"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
      setError(e instanceof Error ? e.message : "Failed to load conversation");
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [selectedId, tenant]);

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
          title="Select a conversation"
          description="Choose a conversation from the list to view the message history and customer details."
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading conversation..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState
          title="Failed to load conversation"
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
          title="Conversation not found"
          description="This conversation may have been deleted or doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Message thread */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900">
            {conversation.customer?.name || conversation.chat_id}
          </h3>
          <p className="text-sm text-gray-500">
            {conversation.messages.length} messages
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ConversationDetail messages={conversation.messages} />
        </div>
      </div>

      {/* Sidebar - Profile & Orders */}
      <div className="w-64 border-l border-gray-200 overflow-y-auto">
        <CustomerProfile customer={conversation.customer} />
        <div className="border-t border-gray-200">
          <CustomerOrders orders={conversation.orders} />
        </div>
      </div>
    </div>
  );
}
