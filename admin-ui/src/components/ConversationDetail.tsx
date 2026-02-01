"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Message } from "@/lib/api";
import { useLocale } from "@/i18n/client";

interface ConversationDetailProps {
  messages: Message[];
}

export default function ConversationDetail({
  messages,
}: ConversationDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const { locale } = useLocale();

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("time.today");
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t("time.yesterday");
    }
    return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB");
  };

  // Auto-scroll to bottom when messages load or change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        {t("conversations.noMessages")}
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
    <div ref={scrollRef} className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, msgs]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-medium">
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
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-indigo-600 text-white"
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
                        ? "text-slate-400"
                        : "text-indigo-200"
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
