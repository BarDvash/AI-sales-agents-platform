"""
Admin API endpoints for viewing conversations, orders, and customers.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from collections import Counter

from storage.database import get_db
from storage.repositories import (
    TenantRepository,
    ConversationRepository,
    CustomerRepository,
    OrderRepository,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# === Pydantic Models ===

class ConversationListItem(BaseModel):
    id: int
    chat_id: str
    customer_id: int
    customer_name: Optional[str]
    last_message: Optional[str]
    last_message_at: Optional[datetime]
    message_count: int
    status: str
    channel: Optional[str] = "unknown"  # Primary channel (from most recent message)

    class Config:
        from_attributes = True


class MessageItem(BaseModel):
    id: int
    role: str
    content: str
    channel: Optional[str] = "unknown"
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerInfo(BaseModel):
    id: int
    name: Optional[str]
    address: Optional[str]
    language: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    id: str
    status: str
    total: float
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItem(BaseModel):
    product_name: str
    quantity: str  # Can be "2kg", "1.5", etc.
    unit_price: float
    subtotal: float


class OrderListItem(BaseModel):
    id: str
    customer_id: int
    customer_name: Optional[str]
    items: list[OrderItem]
    status: str
    total: float
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetail(BaseModel):
    id: str
    customer_id: int
    customer_name: Optional[str]
    items: list[OrderItem]
    status: str
    total: float
    delivery_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CustomerDetail(BaseModel):
    id: int
    chat_id: str
    name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    language: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    chat_id: str
    status: str
    channel: Optional[str] = "unknown"  # Primary channel (from most recent message)
    messages: list[MessageItem]
    customer: Optional[CustomerInfo]
    orders: list[OrderSummary]

    class Config:
        from_attributes = True


# === Analytics Models ===

class RevenueStats(BaseModel):
    total: float
    this_month: float
    this_week: float
    avg_order_value: float


class OrderStats(BaseModel):
    total: int
    by_status: dict[str, int]


class TopProduct(BaseModel):
    name: str
    count: int
    revenue: float


class ConversationStats(BaseModel):
    total: int
    by_channel: dict[str, int]


class TopCustomer(BaseModel):
    id: int
    name: Optional[str]
    total_orders: int
    total_spent: float


class CustomerStats(BaseModel):
    total: int
    new_this_month: int
    top_customers: list[TopCustomer]


class AnalyticsData(BaseModel):
    revenue: RevenueStats
    orders: OrderStats
    top_products: list[TopProduct]
    conversations: ConversationStats
    customers: CustomerStats


# === Helper Functions ===

def verify_tenant(tenant_id: str, db: Session) -> None:
    """Verify tenant exists, raise 404 if not."""
    tenant_repo = TenantRepository(db)
    tenant = tenant_repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant '{tenant_id}' not found")


# === Endpoints ===

@router.get("/{tenant_id}/conversations")
def list_conversations(tenant_id: str, db: Session = Depends(get_db)):
    """
    List all conversations for a tenant, sorted by most recent activity.
    """
    verify_tenant(tenant_id, db)

    conv_repo = ConversationRepository(db)
    customer_repo = CustomerRepository(db)

    conversations = conv_repo.get_by_tenant(tenant_id)

    result = []
    for conv in conversations:
        # Get customer info
        customer = customer_repo.get_by_id(conv.customer_id)

        # Get last message
        messages = conv_repo.get_recent_messages(conv.id, limit=1)
        last_message = messages[0] if messages else None

        result.append(ConversationListItem(
            id=conv.id,
            chat_id=customer.chat_id if customer else "unknown",
            customer_id=conv.customer_id,
            customer_name=customer.name if customer else None,
            last_message=last_message.content[:100] if last_message else None,
            last_message_at=last_message.created_at if last_message else conv.created_at,
            message_count=conv.total_message_count or 0,
            status=conv.status,
            channel=last_message.channel if last_message and last_message.channel else "unknown",
        ))

    return result


@router.get("/{tenant_id}/conversations/{conversation_id}")
def get_conversation(tenant_id: str, conversation_id: int, db: Session = Depends(get_db)):
    """
    Get a single conversation with all messages, customer info, and orders.
    """
    verify_tenant(tenant_id, db)

    conv_repo = ConversationRepository(db)
    customer_repo = CustomerRepository(db)
    order_repo = OrderRepository(db)

    # Get conversation
    conversation = conv_repo.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    # Verify conversation belongs to tenant
    if conversation.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    # Get all messages
    messages = conv_repo.get_messages(conversation.id)

    # Get customer
    customer = customer_repo.get_by_id(conversation.customer_id)
    customer_info = None
    if customer:
        customer_info = CustomerInfo(
            id=customer.id,
            name=customer.name,
            address=customer.address,
            language=customer.language,
            notes=customer.notes,
        )

    # Get customer orders
    orders = []
    if customer:
        customer_orders = order_repo.get_by_customer(customer.id)
        orders = [
            OrderSummary(
                id=o.id,
                status=o.status,
                total=o.total,
                created_at=o.created_at,
            )
            for o in customer_orders
        ]

    # Determine primary channel from most recent message
    primary_channel = "unknown"
    if messages:
        # Get channel from most recent message that has one
        for msg in reversed(messages):
            if msg.channel:
                primary_channel = msg.channel
                break

    return ConversationDetail(
        id=conversation.id,
        chat_id=customer.chat_id if customer else "unknown",
        status=conversation.status,
        channel=primary_channel,
        messages=[
            MessageItem(
                id=m.id,
                role=m.role,
                content=m.content,
                channel=m.channel or "unknown",
                created_at=m.created_at,
            )
            for m in messages
        ],
        customer=customer_info,
        orders=orders,
    )


@router.get("/{tenant_id}/orders")
def list_orders(
    tenant_id: str,
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    List all orders for a tenant with optional filters.
    Query params: ?status=pending&customer_id=1
    """
    verify_tenant(tenant_id, db)

    order_repo = OrderRepository(db)
    customer_repo = CustomerRepository(db)

    # Get orders for tenant
    orders = order_repo.get_by_tenant(tenant_id)

    # Apply filters
    if status:
        orders = [o for o in orders if o.status == status]
    if customer_id:
        orders = [o for o in orders if o.customer_id == customer_id]

    result = []
    for order in orders:
        customer = customer_repo.get_by_id(order.customer_id)
        result.append(OrderListItem(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=customer.name if customer else None,
            items=[OrderItem(**item) for item in order.items],
            status=order.status,
            total=order.total,
            created_at=order.created_at,
        ))

    return result


@router.get("/{tenant_id}/orders/{order_id}")
def get_order(tenant_id: str, order_id: str, db: Session = Depends(get_db)):
    """
    Get a single order with full details.
    """
    verify_tenant(tenant_id, db)

    order_repo = OrderRepository(db)
    customer_repo = CustomerRepository(db)

    order = order_repo.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    # Verify order belongs to tenant
    if order.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    customer = customer_repo.get_by_id(order.customer_id)

    return OrderDetail(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=customer.name if customer else None,
        items=[OrderItem(**item) for item in order.items],
        status=order.status,
        total=order.total,
        delivery_notes=order.delivery_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.get("/{tenant_id}/customers/{customer_id}")
def get_customer(tenant_id: str, customer_id: int, db: Session = Depends(get_db)):
    """
    Get a customer profile.
    """
    verify_tenant(tenant_id, db)

    customer_repo = CustomerRepository(db)

    customer = customer_repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

    # Verify customer belongs to tenant
    if customer.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

    return CustomerDetail(
        id=customer.id,
        chat_id=customer.chat_id,
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        language=customer.language,
        notes=customer.notes,
        created_at=customer.created_at,
    )


@router.get("/{tenant_id}/analytics")
def get_analytics(tenant_id: str, db: Session = Depends(get_db)):
    """
    Get aggregated analytics data for a tenant.
    """
    verify_tenant(tenant_id, db)

    order_repo = OrderRepository(db)
    conv_repo = ConversationRepository(db)
    customer_repo = CustomerRepository(db)

    now = datetime.now(timezone.utc)
    start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = datetime(start_of_week.year, start_of_week.month, start_of_week.day, tzinfo=timezone.utc)

    # === Revenue & Order Stats ===
    orders = order_repo.get_by_tenant(tenant_id)

    total_revenue = sum(o.total for o in orders)
    month_revenue = sum(o.total for o in orders if o.created_at >= start_of_month)
    week_revenue = sum(o.total for o in orders if o.created_at >= start_of_week)
    avg_order_value = total_revenue / len(orders) if orders else 0

    # Order status breakdown
    status_counts: dict[str, int] = {}
    for o in orders:
        status_counts[o.status] = status_counts.get(o.status, 0) + 1

    # === Top Products ===
    product_counts: Counter[str] = Counter()
    product_revenue: dict[str, float] = {}

    for order in orders:
        for item in order.items:
            product_name = item.get("product_name", "Unknown")
            product_counts[product_name] += 1
            product_revenue[product_name] = product_revenue.get(product_name, 0) + item.get("subtotal", 0)

    top_products = [
        TopProduct(name=name, count=count, revenue=product_revenue.get(name, 0))
        for name, count in product_counts.most_common(10)
    ]

    # === Conversation Stats ===
    conversations = conv_repo.get_by_tenant(tenant_id)
    channel_counts: dict[str, int] = {"telegram": 0, "whatsapp": 0}

    for conv in conversations:
        # Get last message to determine channel
        messages = conv_repo.get_recent_messages(conv.id, limit=1)
        if messages and messages[0].channel:
            channel = messages[0].channel
            if channel in channel_counts:
                channel_counts[channel] += 1

    # === Customer Stats ===
    customers = customer_repo.get_by_tenant(tenant_id)
    new_customers_this_month = sum(1 for c in customers if c.created_at >= start_of_month)

    # Top customers by total spent
    customer_totals: dict[int, float] = {}
    customer_order_counts: dict[int, int] = {}

    for order in orders:
        customer_totals[order.customer_id] = customer_totals.get(order.customer_id, 0) + order.total
        customer_order_counts[order.customer_id] = customer_order_counts.get(order.customer_id, 0) + 1

    # Sort by total spent
    top_customer_ids = sorted(customer_totals.keys(), key=lambda cid: customer_totals[cid], reverse=True)[:5]

    top_customers = []
    for cid in top_customer_ids:
        customer = customer_repo.get_by_id(cid)
        top_customers.append(TopCustomer(
            id=cid,
            name=customer.name if customer else None,
            total_orders=customer_order_counts.get(cid, 0),
            total_spent=customer_totals.get(cid, 0),
        ))

    return AnalyticsData(
        revenue=RevenueStats(
            total=total_revenue,
            this_month=month_revenue,
            this_week=week_revenue,
            avg_order_value=avg_order_value,
        ),
        orders=OrderStats(
            total=len(orders),
            by_status=status_counts,
        ),
        top_products=top_products,
        conversations=ConversationStats(
            total=len(conversations),
            by_channel=channel_counts,
        ),
        customers=CustomerStats(
            total=len(customers),
            new_this_month=new_customers_this_month,
            top_customers=top_customers,
        ),
    )
