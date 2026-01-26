"""
Admin API endpoints for viewing conversations, orders, and customers.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

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

    class Config:
        from_attributes = True


class MessageItem(BaseModel):
    id: int
    role: str
    content: str
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
    messages: list[MessageItem]
    customer: Optional[CustomerInfo]
    orders: list[OrderSummary]

    class Config:
        from_attributes = True


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

    return ConversationDetail(
        id=conversation.id,
        chat_id=customer.chat_id if customer else "unknown",
        status=conversation.status,
        messages=[
            MessageItem(
                id=m.id,
                role=m.role,
                content=m.content,
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
