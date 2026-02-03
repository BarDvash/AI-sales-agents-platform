"use client";

interface VelocitySalesLogoProps {
  showWordmark?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function VelocitySalesLogo({
  showWordmark = true,
  size = "medium",
  className = "",
}: VelocitySalesLogoProps) {
  const iconSizes = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const textSizes = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl",
  };

  const taglineSizes = {
    small: "text-[8px]",
    medium: "text-[9px]",
    large: "text-[10px]",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - V with velocity arrows */}
      <svg
        className={iconSizes[size]}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* V Shape */}
        <path
          d="M 8 8 L 25 40 L 42 8"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Velocity arrows */}
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

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div
            className={`font-bold tracking-tight leading-none ${textSizes[size]}`}
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            <span style={{ color: "var(--text-primary)" }}>Velocity</span>
            <span style={{ color: "var(--brand-primary)" }}>Sales</span>
          </div>
          {size !== "small" && (
            <span
              className={`uppercase tracking-widest ${taglineSizes[size]}`}
              style={{
                color: "var(--brand-accent)",
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
              }}
            >
              AI Sales Agents
            </span>
          )}
        </div>
      )}
    </div>
  );
}
