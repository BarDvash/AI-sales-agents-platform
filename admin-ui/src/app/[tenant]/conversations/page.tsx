import { Suspense } from "react";
import { getConversations, ConversationListItem } from "@/lib/api";
import ConversationList from "@/components/ConversationList";
import ConversationView from "@/components/ConversationView";

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  let conversations: ConversationListItem[] = [];
  let error: string | null = null;

  try {
    conversations = await getConversations(tenant);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load conversations";
    conversations = [];
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left sidebar - Conversation list */}
      <div className="w-80 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {error ? (
            <div className="p-4 text-red-500 text-sm">{error}</div>
          ) : (
            <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
              <ConversationList conversations={conversations} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Right panel - Conversation detail */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}>
          <ConversationView tenant={tenant} />
        </Suspense>
      </div>
    </div>
  );
}
