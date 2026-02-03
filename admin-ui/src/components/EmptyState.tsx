"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "conversations" | "orders" | "messages";
}

// Branded illustrations incorporating VelocitySales V logo with velocity arrows
const icons = {
  conversations: (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      {/* Chat bubble outline */}
      <path
        d="M15 20 C15 14 20 10 28 10 L52 10 C60 10 65 14 65 20 L65 45 C65 51 60 55 52 55 L35 55 L22 65 L22 55 L28 55 C20 55 15 51 15 45 Z"
        fill="none"
        stroke="var(--empty-icon)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* V Logo inside bubble */}
      <path
        d="M30 25 L40 42 L50 25"
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      />
      {/* Velocity arrows */}
      <path
        d="M44 28 L48 28 L46 31 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0s" }}
      />
      <path
        d="M46 33 L51 33 L49 36 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0.2s" }}
      />
    </svg>
  ),
  orders: (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      {/* Clipboard outline */}
      <rect
        x="18"
        y="12"
        width="44"
        height="58"
        rx="4"
        fill="none"
        stroke="var(--empty-icon)"
        strokeWidth="2"
      />
      {/* Clipboard top */}
      <rect
        x="30"
        y="8"
        width="20"
        height="8"
        rx="2"
        fill="none"
        stroke="var(--empty-icon)"
        strokeWidth="2"
      />
      {/* V Logo on clipboard */}
      <path
        d="M30 30 L40 47 L50 30"
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      />
      {/* Velocity arrows */}
      <path
        d="M44 33 L48 33 L46 36 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0s" }}
      />
      <path
        d="M46 38 L51 38 L49 41 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0.2s" }}
      />
      {/* List lines */}
      <line
        x1="26"
        y1="55"
        x2="54"
        y2="55"
        stroke="var(--empty-icon)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="26"
        y1="62"
        x2="46"
        y2="62"
        stroke="var(--empty-icon)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  ),
  messages: (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      {/* Message bubble */}
      <path
        d="M10 15 C10 11 14 8 20 8 L60 8 C66 8 70 11 70 15 L70 50 C70 54 66 57 60 57 L25 57 L15 67 L15 57 L20 57 C14 57 10 54 10 50 Z"
        fill="none"
        stroke="var(--empty-icon)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* V Logo */}
      <path
        d="M28 22 L40 42 L52 22"
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      />
      {/* Velocity arrows */}
      <path
        d="M45 26 L50 26 L48 29 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0s" }}
      />
      <path
        d="M47 32 L53 32 L51 35 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0.2s" }}
      />
      <path
        d="M49 38 L56 38 L54 41 Z"
        fill="var(--brand-primary)"
        className="animate-velocity-arrow opacity-50"
        style={{ animationDelay: "0.4s" }}
      />
    </svg>
  ),
};

export default function EmptyState({
  title,
  description,
  icon = "conversations",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icons[icon]}
      <h3
        className="mt-4 text-base font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="mt-2 text-sm max-w-sm"
          style={{ color: "var(--text-faint)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
