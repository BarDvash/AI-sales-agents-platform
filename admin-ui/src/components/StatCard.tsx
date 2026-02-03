"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: StatCardProps) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </p>
          <p
            className="mt-1 text-2xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className="mt-1 text-sm font-medium"
              style={{
                color: trend.isPositive
                  ? "var(--status-completed-text)"
                  : "var(--status-cancelled-text)",
              }}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
