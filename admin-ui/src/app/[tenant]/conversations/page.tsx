import { Suspense } from "react";
import { getConversations, ConversationListItem } from "@/lib/api";
import ConversationsPanel from "@/components/ConversationsPanel";
import ConversationView from "@/components/ConversationView";
import ThemedPanel from "@/components/ThemedPanel";

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
      {/* Left sidebar - Conversation list with filter */}
      <ThemedPanel className="w-80 flex-shrink-0">
        {error ? (
          <div className="p-4 text-sm" style={{ color: "var(--error-text)" }}>{error}</div>
        ) : (
          <Suspense fallback={<div className="p-4" style={{ color: "var(--text-muted)" }}>Loading...</div>}>
            <ConversationsPanel conversations={conversations} />
          </Suspense>
        )}
      </ThemedPanel>

      {/* Right panel - Conversation detail */}
      <ThemedPanel className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>Loading...</div>}>
          <ConversationView tenant={tenant} />
        </Suspense>
      </ThemedPanel>
    </div>
  );
}
