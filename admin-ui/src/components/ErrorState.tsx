"use client";

import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations();
  const displayTitle = title || t("error.title");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        className="w-12 h-12"
        style={{ color: "var(--error-text)" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <h3
        className="mt-4 text-lg font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {displayTitle}
      </h3>
      <p
        className="mt-2 text-sm max-w-sm"
        style={{ color: "var(--error-text)" }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
        >
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
