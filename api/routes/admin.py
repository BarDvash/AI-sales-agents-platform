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
