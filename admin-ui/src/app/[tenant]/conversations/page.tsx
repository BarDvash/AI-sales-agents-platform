import { Suspense } from "react";
import { getConversations, ConversationListItem } from "@/lib/api";
import ConversationList from "@/components/ConversationList";
import ConversationView from "@/components/ConversationView";
import PanelHeader from "@/components/PanelHeader";

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
      <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-slate-200/60 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_4px_rgb(0_0_0/0.05)] overflow-hidden">
        <PanelHeader titleKey="conversations.title" />

        <div className="overflow-y-auto h-[calc(100%-3rem)]">
          {error ? (
            <div className="p-4 text-red-500 text-sm">{error}</div>
          ) : (
            <Suspense fallback={<div className="p-4 text-slate-500">Loading...</div>}>
              <ConversationList conversations={conversations} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Right panel - Conversation detail */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/60 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_4px_rgb(0_0_0/0.05)] overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-500">Loading...</div>}>
          <ConversationView tenant={tenant} />
        </Suspense>
      </div>
    </div>
  );
}
