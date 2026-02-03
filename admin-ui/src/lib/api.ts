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

// Telegram doodle pattern as inline SVG data URI (Cosmogram style - outline icons)
const telegramPatternSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
<g fill="none" stroke="rgba(135,116,225,0.15)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
<!-- Row 1 -->
<path d="M12,8 L16,14 L12,12 L8,14 Z"/> <!-- Star/diamond -->
<circle cx="35" cy="12" r="4"/>
<path d="M55,6 L62,10 L60,18 L55,14 Z"/> <!-- Paper plane -->
<path d="M82,8 C82,4 86,4 88,8 C90,4 94,4 94,8 C94,14 88,18 88,18 C88,18 82,14 82,8"/> <!-- Heart -->
<path d="M112,15 A6,6 0 1,1 112,3 A4,4 0 1,0 112,15"/> <!-- Moon -->
<polygon points="138,6 140,12 146,12 141,16 143,22 138,18 133,22 135,16 130,12 136,12"/> <!-- Star -->
<path d="M160,8 L168,8 M164,4 L164,12"/> <!-- Plus -->
<path d="M185,5 L192,12 M192,5 L185,12"/> <!-- X -->

<!-- Row 2 -->
<path d="M8,35 Q12,28 16,35 L12,42 Z"/> <!-- Rocket -->
<path d="M38,30 L38,42 M32,36 L44,36"/> <!-- Plus -->
<polygon points="58,28 62,38 68,28"/> <!-- Triangle -->
<circle cx="88" cy="35" r="5"/>
<path d="M108,30 L116,30 L116,40 L108,40 Z"/> <!-- Square -->
<path d="M135,28 C130,32 130,38 135,42 C140,38 140,32 135,28"/> <!-- Leaf -->
<path d="M158,32 L158,40 C158,44 166,44 166,40 L166,28"/> <!-- Cup -->
<path d="M182,30 C182,26 190,26 190,30 C190,38 186,42 186,42 C186,42 182,38 182,30"/> <!-- Heart -->

<!-- Row 3 -->
<path d="M15,55 L8,65 L22,65 Z"/> <!-- Triangle -->
<path d="M35,52 L42,58 L35,64 L28,58 Z"/> <!-- Diamond -->
<circle cx="60" cy="58" r="3"/>
<path d="M80,52 L88,56 L86,65 L80,60 Z"/> <!-- Plane -->
<polygon points="108,52 112,62 118,52 115,58 118,65 108,60 98,65 101,58 98,52 105,58"/> <!-- Star 6pt -->
<path d="M138,55 A5,5 0 1,1 138,65 A3,3 0 1,0 138,55"/> <!-- Moon -->
<path d="M155,55 L165,55 L165,65 L155,65 Z M158,58 L162,62"/> <!-- Envelope -->
<path d="M185,52 L185,65 M180,57 L185,52 L190,57"/> <!-- Arrow up -->

<!-- Row 4 -->
<path d="M10,78 C6,82 6,88 10,92 C14,88 14,82 10,78"/> <!-- Leaf -->
<circle cx="35" cy="85" r="4"/>
<path d="M52,80 L60,80 L60,90 L52,90 Z"/> <!-- Square -->
<path d="M78,78 C78,74 86,74 86,78 C86,86 82,90 82,90 C82,90 78,86 78,78"/> <!-- Heart -->
<path d="M105,82 L112,78 L112,92 L105,88 L98,92 L98,78 Z"/> <!-- Flag -->
<polygon points="135,78 138,88 145,78"/> <!-- Triangle -->
<path d="M160,80 L168,85 L160,90"/> <!-- Play -->
<path d="M182,78 L190,85 M182,85 L190,78 M182,92 L190,85"/> <!-- Asterisk -->

<!-- Row 5 -->
<polygon points="12,105 15,115 22,105 18,112 22,120 12,115 2,120 5,112 2,105 8,112"/> <!-- Star -->
<path d="M35,102 L42,108 L35,114 L28,108 Z"/> <!-- Diamond -->
<circle cx="58" cy="110" r="5"/>
<path d="M78,105 L86,110 L78,115 Z"/> <!-- Triangle -->
<path d="M102,105 A6,6 0 1,1 102,115 A4,4 0 1,0 102,105"/> <!-- Moon -->
<path d="M125,105 L132,108 L130,118 L125,112 Z"/> <!-- Plane -->
<path d="M152,105 L152,118 M147,110 L152,105 L157,110"/> <!-- Arrow -->
<path d="M178,102 C178,98 186,98 186,102 C186,110 182,115 182,115 C182,115 178,110 178,102"/> <!-- Heart -->

<!-- Row 6 -->
<path d="M8,130 L16,135 L8,140 Z"/> <!-- Triangle -->
<circle cx="35" cy="135" r="3"/>
<path d="M52,128 L60,135 M52,135 L60,128"/> <!-- X -->
<path d="M78,130 L78,142 M72,136 L84,136"/> <!-- Plus -->
<polygon points="105,128 108,138 115,128 112,135 115,142 105,138 95,142 98,135 95,128 102,135"/> <!-- Star -->
<path d="M132,130 L140,130 L140,140 L132,140 Z M135,133 L137,137"/> <!-- Envelope -->
<path d="M158,128 C153,132 153,138 158,142 C163,138 163,132 158,128"/> <!-- Leaf -->
<path d="M180,130 L188,135 L180,140"/> <!-- Play -->

<!-- Row 7 -->
<path d="M12,158 A5,5 0 1,1 12,168 A3,3 0 1,0 12,158"/> <!-- Moon -->
<path d="M32,155 L40,160 L38,170 L32,165 Z"/> <!-- Plane -->
<circle cx="58" cy="162" r="4"/>
<path d="M78,158 L86,158 L86,168 L78,168 Z"/> <!-- Square -->
<path d="M105,155 C105,151 113,151 113,155 C113,163 109,168 109,168 C109,168 105,163 105,155"/> <!-- Heart -->
<polygon points="135,155 138,165 145,155"/> <!-- Triangle -->
<path d="M160,158 L168,162 L160,168 L152,162 Z"/> <!-- Diamond -->
<path d="M182,155 L182,168 M177,160 L182,155 L187,160"/> <!-- Arrow -->

<!-- Row 8 -->
<polygon points="12,182 15,192 22,182 18,188 22,195 12,190 2,195 5,188 2,182 8,188"/> <!-- Star -->
<path d="M35,180 L35,195 M30,185 L40,185"/> <!-- Plus -->
<path d="M52,182 L60,188 M52,188 L60,182"/> <!-- X -->
<circle cx="82" cy="188" r="5"/>
<path d="M102,182 L110,188 L102,195 Z"/> <!-- Triangle -->
<path d="M128,180 C123,185 123,192 128,198 C133,192 133,185 128,180"/> <!-- Leaf -->
<path d="M152,182 A6,6 0 1,1 152,195 A4,4 0 1,0 152,182"/> <!-- Moon -->
<path d="M178,182 C178,178 186,178 186,182 C186,190 182,195 182,195 C182,195 178,190 178,182"/> <!-- Heart -->
</g>
</svg>`)}`;

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
    chatBgImage: telegramPatternSvg, // Telegram doodle pattern (inline SVG)
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
  // Default fallback - VelocitySales brand green theme
  default: {
    chatBgColor: "#f1f5f9", // slate-100
    userBubbleBgColor: "#e2e8f0", // slate-200
    userBubbleTextColor: "#1e293b", // slate-800
    bubbleBgColor: "#1b9955", // VelocitySales brand secondary
    bubbleTextColor: "#ffffff",
    bubbleTimestampColor: "#95d5b2", // VelocitySales brand accent
    headerBgColor: "#1e293b", // slate-800
    headerBorderColor: "#334155", // slate-700
    activeBgColor: "rgba(46, 204, 113, 0.15)", // VelocitySales brand primary/15
    activeBorderColor: "#2ecc71", // VelocitySales brand primary
    badgeBgColor: "rgba(46, 204, 113, 0.15)", // VelocitySales brand primary/15
    badgeTextColor: "#2ecc71", // VelocitySales brand primary
    iconColor: "#2ecc71", // VelocitySales brand primary
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

// === Analytics Types ===

export interface RevenueStats {
  total: number;
  this_month: number;
  this_week: number;
  avg_order_value: number;
}

export interface OrderStats {
  total: number;
  by_status: Record<string, number>;
}

export interface TopProduct {
  name: string;
  count: number;
  revenue: number;
}

export interface ConversationStats {
  total: number;
  by_channel: Record<string, number>;
}

export interface TopCustomer {
  id: number;
  name: string | null;
  total_orders: number;
  total_spent: number;
}

export interface CustomerStats {
  total: number;
  new_this_month: number;
  top_customers: TopCustomer[];
}

export interface AnalyticsData {
  revenue: RevenueStats;
  orders: OrderStats;
  top_products: TopProduct[];
  conversations: ConversationStats;
  customers: CustomerStats;
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

// Analytics
export async function getAnalytics(tenantId: string): Promise<AnalyticsData> {
  return fetchApi(`/admin/${tenantId}/analytics`);
}
