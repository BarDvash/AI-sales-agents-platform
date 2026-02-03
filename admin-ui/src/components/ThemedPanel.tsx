"use client";

import { ReactNode } from "react";

interface ThemedPanelProps {
  children: ReactNode;
  className?: string;
}

export default function ThemedPanel({ children, className = "" }: ThemedPanelProps) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {children}
    </div>
  );
}
