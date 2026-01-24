"""
Cancel Order Tool

Cancels an existing order for the customer.
"""

from sqlalchemy.orm import Session
from storage.repositories import OrderRepository, CustomerRepository

# Tool definition for Claude API
TOOL_DEF = {
    "name": "cancel_order",
    "description": "Cancels an existing order. Use this when the customer wants to cancel an order. Only pending orders can be cancelled.",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "string",
                "description": "The order ID to cancel (e.g., 'VALDMAN-ORD-0001')"
            }
        },
        "required": ["order_id"]
    }
}


def cancel_order(tenant_id: str, chat_id: str, tool_input: dict, db: Session) -> dict:
    """
    Cancel an existing order.

    Args:
        tenant_id: Tenant ID (e.g., "valdman")
        chat_id: Telegram/WhatsApp chat ID of the customer
        tool_input: Tool input with order_id
        db: Database session

    Returns:
        dict: Result of the cancellation attempt
    """
    order_id = tool_input.get("order_id", "").strip()

    if not order_id:
        return {"success": False, "error": "No order ID provided"}

    # Verify customer exists
    customer_repo = CustomerRepository(db)
    customer = customer_repo.get_by_chat_id(tenant_id, chat_id)

    if not customer:
        return {"success": False, "error": "No orders found for this customer"}

    # Get the order
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)

    if not order:
        return {"success": False, "error": f"Order {order_id} not found"}

    # Verify order belongs to this customer and tenant
    if order.customer_id != customer.id or order.tenant_id != tenant_id:
        return {"success": False, "error": f"Order {order_id} not found"}

    # Only pending orders can be cancelled
    if order.status != "pending":
        return {
            "success": False,
            "error": f"Order {order_id} cannot be cancelled (status: {order.status})"
        }

    # Cancel the order
    order_repo.update_status(order_id, "cancelled")

    print(f"[Live][Tool] cancel_order → {order_id} | cancelled")

    return {
        "success": True,
        "order_id": order_id,
        "message": f"Order {order_id} has been cancelled"
    }
