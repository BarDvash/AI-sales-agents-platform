"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConversationDetail as ConversationDetailType, getConversation } from "@/lib/api";
import ConversationDetail from "./ConversationDetail";
import CustomerProfile from "./CustomerProfile";
import CustomerOrders from "./CustomerOrders";

interface ConversationViewProps {
  tenant: string;
}

export default function ConversationView({ tenant }: ConversationViewProps) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  const [conversation, setConversation] = useState<ConversationDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setConversation(null);
      return;
    }

    async function loadConversation() {
      setLoading(true);
      setError(null);
      try {
        const data = await getConversation(tenant, parseInt(selectedId!));
        setConversation(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load conversation");
        setConversation(null);
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [selectedId, tenant]);

  // No conversation selected
  if (!selectedId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a conversation</p>
          <p className="text-sm mt-1">to view details</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // No data
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Conversation not found</div>
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
