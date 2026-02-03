"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Message, ChannelType, getChannelColors } from "@/lib/api";
import { useLocale } from "@/i18n/client";

// Channel icons as simple SVG components
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  switch (channel) {
    case "telegram":
      return <TelegramIcon className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    default:
      return null;
  }
}

interface ConversationDetailProps {
  messages: Message[];
  channel: ChannelType;
}

export default function ConversationDetail({
  messages,
  channel,
}: ConversationDetailProps) {
  const colors = getChannelColors(channel);
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

  // Build background style with optional doodle pattern
  const chatBgStyle: React.CSSProperties = {
    backgroundColor: colors.chatBgColor,
  };
  if (colors.chatBgImage) {
    // Check if it's a data URI (SVG) or external URL
    const isSvgDataUri = colors.chatBgImage.startsWith("data:image/svg");
    chatBgStyle.backgroundImage = `url("${colors.chatBgImage}")`;
    chatBgStyle.backgroundRepeat = "repeat";
    if (isSvgDataUri) {
      // SVG patterns - use smaller size for denser pattern
      chatBgStyle.backgroundSize = "200px 200px";
    } else {
      // External images (like WhatsApp) - use larger size with blend mode
      chatBgStyle.backgroundSize = "412.5px auto";
      chatBgStyle.backgroundBlendMode = "soft-light";
    }
  }

  if (messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={chatBgStyle}
      >
        <span className="text-white/60">{t("conversations.noMessages")}</span>
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
    <div
      ref={scrollRef}
      className="flex flex-col h-full overflow-y-auto p-4 space-y-4"
      style={chatBgStyle}
    >
      {Object.entries(messagesByDate).map(([date, msgs]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
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
                  className="max-w-[70%] rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: message.role === "user"
                      ? colors.userBubbleBgColor
                      : colors.bubbleBgColor,
                    color: message.role === "user"
                      ? colors.userBubbleTextColor
                      : colors.bubbleTextColor,
                  }}
                >
                  {/* Message content */}
                  <p
                    className="text-sm whitespace-pre-wrap break-words"
                    dir="auto"
                  >
                    {message.content}
                  </p>

                  {/* Timestamp and channel indicator */}
                  <div
                    className="flex items-center gap-1.5 mt-1"
                    style={{
                      color: message.role === "user"
                        ? "rgba(255, 255, 255, 0.5)"
                        : colors.bubbleTimestampColor,
                    }}
                  >
                    <ChannelIcon channel={message.channel} className="w-3 h-3" />
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
