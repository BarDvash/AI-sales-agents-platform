"use client";

import { Message } from "@/lib/api";

interface ConversationDetailProps {
  messages: Message[];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString();
}

export default function ConversationDetail({
  messages,
}: ConversationDetailProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No messages
      </div>
    );
  }

  // Group messages by date
  const messagesByDate: { [date: string]: Message[] } = {};
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(msg);
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, msgs]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
              {date}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="space-y-3">
            {msgs.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {/* Message content */}
                  <p
                    className="text-sm whitespace-pre-wrap break-words"
                    dir="auto"
                  >
                    {message.content}
                  </p>

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-gray-400"
                        : "text-blue-200"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
