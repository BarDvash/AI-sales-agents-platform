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

// Channel color configuration
export type ChannelType = "telegram" | "whatsapp" | string;

export interface ChannelColors {
  // Assistant message bubble (inline styles for dynamic rendering)
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
    bubbleBgColor: "#0ea5e9", // sky-500
    bubbleTextColor: "#ffffff",
    bubbleTimestampColor: "#bae6fd", // sky-200
    headerBgColor: "rgba(240, 249, 255, 0.5)", // sky-50/50
    headerBorderColor: "#bae6fd", // sky-200
    activeBgColor: "rgba(240, 249, 255, 0.5)", // sky-50/50
    activeBorderColor: "#0ea5e9", // sky-500
    badgeBgColor: "#e0f2fe", // sky-100
    badgeTextColor: "#0369a1", // sky-700
    iconColor: "#0ea5e9", // sky-500
  },
  whatsapp: {
    bubbleBgColor: "#10b981", // emerald-500
    bubbleTextColor: "#ffffff",
    bubbleTimestampColor: "#a7f3d0", // emerald-200
    headerBgColor: "rgba(236, 253, 245, 0.5)", // emerald-50/50
    headerBorderColor: "#a7f3d0", // emerald-200
    activeBgColor: "rgba(236, 253, 245, 0.5)", // emerald-50/50
    activeBorderColor: "#10b981", // emerald-500
    badgeBgColor: "#d1fae5", // emerald-100
    badgeTextColor: "#047857", // emerald-700
    iconColor: "#10b981", // emerald-500
  },
  // Default fallback
  default: {
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
