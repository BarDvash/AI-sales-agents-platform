/**
 * API client for Admin Dashboard
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// === Types ===

export interface ConversationListItem {
  id: number;
  chat_id: string;
  customer_id: number;
  customer_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
  message_count: number;
  status: string;
  channel: "telegram" | "whatsapp" | string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  channel: "telegram" | "whatsapp" | string;
  created_at: string;
}

export interface CustomerInfo {
  id: number;
  name: string | null;
  address: string | null;
  language: string | null;
  notes: string | null;
}

export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

export interface ConversationDetail {
  id: number;
  chat_id: string;
  status: string;
  channel: "telegram" | "whatsapp" | string;
  messages: Message[];
  customer: CustomerInfo | null;
  orders: OrderSummary[];
}

// Channel color configuration - using official app colors
export type ChannelType = "telegram" | "whatsapp" | string;

export interface ChannelColors {
  // Chat background (authentic app backgrounds)
  chatBgColor: string;
  chatBgImage?: string; // Optional doodle pattern URL
  // User message bubble
  userBubbleBgColor: string;
  userBubbleTextColor: string;
  // Assistant/outgoing message bubble
  bubbleBgColor: string;
  bubbleTextColor: string;
  bubbleTimestampColor: string;
  // Header/accent (inline styles)
  headerBgColor: string;
  headerBorderColor: string;
  // Selection/active state (inline styles)
  activeBgColor: string;
  activeBorderColor: string;
  // Badge (inline styles)
  badgeBgColor: string;
  badgeTextColor: string;
  // Icon color
  iconColor: string;
}

export const channelColorConfig: Record<string, ChannelColors> = {
  telegram: {
    // Telegram dark theme with pattern (Cosmogram style)
    chatBgColor: "#0f0f0f", // Dark background for pattern
    chatBgImage: "https://web.telegram.org/a/chat-bg-pattern-dark.ee6e5f9f7b46e21a4a49.png", // Telegram doodle pattern
    userBubbleBgColor: "#212121", // Incoming message (user) - dark gray
    userBubbleTextColor: "#ffffff",
    bubbleBgColor: "#8774e1", // Outgoing message (assistant) - Telegram purple
    bubbleTextColor: "#ffffff",
    bubbleTimestampColor: "rgba(255, 255, 255, 0.5)",
    headerBgColor: "#212121", // Telegram header dark
    headerBorderColor: "#0f0f0f",
    activeBgColor: "rgba(135, 116, 225, 0.2)", // Telegram purple tint
    activeBorderColor: "#8774e1",
    badgeBgColor: "#8774e1",
    badgeTextColor: "#ffffff",
    iconColor: "#8774e1", // Telegram purple
  },
  whatsapp: {
    // WhatsApp official colors
    chatBgColor: "#0b141a", // WhatsApp dark chat background
    chatBgImage: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png",
    userBubbleBgColor: "#202c33", // Incoming message (user) - dark gray
    userBubbleTextColor: "#e9edef",
    bubbleBgColor: "#005c4b", // Outgoing message (assistant) - WhatsApp teal green
    bubbleTextColor: "#e9edef",
    bubbleTimestampColor: "rgba(233, 237, 239, 0.6)",
    headerBgColor: "#202c33", // WhatsApp header dark
    headerBorderColor: "#2a3942",
    activeBgColor: "rgba(0, 92, 75, 0.2)", // WhatsApp green tint
    activeBorderColor: "#00a884",
    badgeBgColor: "#00a884", // WhatsApp green
    badgeTextColor: "#ffffff",
    iconColor: "#00a884", // WhatsApp green
  },
  // Default fallback
  default: {
    chatBgColor: "#f1f5f9", // slate-100
    userBubbleBgColor: "#e2e8f0", // slate-200
    userBubbleTextColor: "#1e293b", // slate-800
    bubbleBgColor: "#4f46e5", // indigo-600
    bubbleTextColor: "#ffffff",
    bubbleTimestampColor: "#c7d2fe", // indigo-200
    headerBgColor: "rgba(248, 250, 252, 0.5)", // slate-50/50
    headerBorderColor: "#e2e8f0", // slate-200
    activeBgColor: "rgba(238, 242, 255, 0.5)", // indigo-50/50
    activeBorderColor: "#6366f1", // indigo-500
    badgeBgColor: "#f1f5f9", // slate-100
    badgeTextColor: "#64748b", // slate-500
    iconColor: "#6366f1", // indigo-500
  },
};

export function getChannelColors(channel: ChannelType): ChannelColors {
  return channelColorConfig[channel] || channelColorConfig.default;
}

export interface OrderItem {
  product_name: string;
  quantity: string;
  unit_price: number;
  subtotal: number;
}

export interface OrderListItem {
  id: string;
  customer_id: number;
  customer_name: string | null;
  items: OrderItem[];
  status: string;
  total: number;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  customer_id: number;
  customer_name: string | null;
  items: OrderItem[];
  status: string;
  total: number;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CustomerDetail {
  id: number;
  chat_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  language: string | null;
  notes: string | null;
  created_at: string;
}

// === API Functions ===

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Conversations
export async function getConversations(
  tenantId: string
): Promise<ConversationListItem[]> {
  return fetchApi(`/admin/${tenantId}/conversations`);
}

export async function getConversation(
  tenantId: string,
  conversationId: number
): Promise<ConversationDetail> {
  return fetchApi(`/admin/${tenantId}/conversations/${conversationId}`);
}

// Orders
export async function getOrders(
  tenantId: string,
  filters?: { status?: string; customer_id?: number }
): Promise<OrderListItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.customer_id)
    params.set("customer_id", filters.customer_id.toString());

  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/admin/${tenantId}/orders${query}`);
}

export async function getOrder(
  tenantId: string,
  orderId: string
): Promise<OrderDetail> {
  return fetchApi(`/admin/${tenantId}/orders/${orderId}`);
}

// Customers
export async function getCustomer(
  tenantId: string,
  customerId: number
): Promise<CustomerDetail> {
  return fetchApi(`/admin/${tenantId}/customers/${customerId}`);
}
