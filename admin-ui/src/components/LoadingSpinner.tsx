"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export default function LoadingSpinner({
  size = "md",
  text,
}: LoadingSpinnerProps) {
  const dimension = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Branded V Logo Spinner */}
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse"
      >
        {/* V Shape */}
        <path
          d="M 8 8 L 25 40 L 42 8"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />
        {/* Velocity arrows with staggered animation */}
        <path
          d="M 28 15 L 34 15 L 31 18 Z"
          fill="var(--brand-primary)"
          className="animate-velocity-arrow"
          style={{ animationDelay: "0s" }}
        />
        <path
          d="M 30 22 L 38 22 L 35 25 Z"
          fill="var(--brand-primary)"
          className="animate-velocity-arrow"
          style={{ animationDelay: "0.2s" }}
        />
        <path
          d="M 32 29 L 42 29 L 39 32 Z"
          fill="var(--brand-primary)"
          className="animate-velocity-arrow"
          style={{ animationDelay: "0.4s" }}
        />
      </svg>
      {text && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {text}
        </p>
      )}
    </div>
  );
}
