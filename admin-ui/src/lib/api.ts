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
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
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
  messages: Message[];
  customer: CustomerInfo | null;
  orders: OrderSummary[];
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
