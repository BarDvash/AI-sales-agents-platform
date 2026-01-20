"""
Get Customer Orders Tool

Retrieves all orders for the current customer.
This tool allows the agent to access order history when customers ask about their orders.
"""

from sqlalchemy.orm import Session
from storage.repositories import OrderRepository, CustomerRepository

# Tool definition for Claude API
TOOL_DEF = {
    "name": "get_customer_orders",
    "description": "Retrieves all orders for the current customer. Use this when the customer asks about their orders, order history, or what they've ordered.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}


def get_customer_orders(tenant_id: str, chat_id: str, db: Session) -> list:
    """
    Retrieve all orders for a specific customer from database.

    Args:
        tenant_id: Tenant ID (e.g., "valdman")
        chat_id: Telegram/WhatsApp chat ID of the customer
        db: Database session

    Returns:
        list: List of order dictionaries for this customer
    """
    # Get customer
    customer_repo = CustomerRepository(db)
    customer = customer_repo.get_by_chat_id(tenant_id, chat_id)

    if not customer:
        return []

    # Get orders
    order_repo = OrderRepository(db)
    orders = order_repo.get_by_customer(customer.id)

    # Convert to dictionaries for Claude
    return [
        {
            "order_id": order.id,
            "items": order.items,
            "total": order.total,
            "delivery_notes": order.delivery_notes,
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }
        for order in orders
    ]
