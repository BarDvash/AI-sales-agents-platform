"""
Update Order Tool

Updates an existing pending order with new items and total.
"""

from sqlalchemy.orm import Session
from storage.repositories import OrderRepository, CustomerRepository

# Tool definition for Claude API
TOOL_DEF = {
    "name": "update_order",
    "description": "Updates an existing pending order with new items and total. Use this when the customer wants to change their order (add/remove items, change quantities). Only pending orders can be updated.",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "string",
                "description": "The order ID to update (e.g., 'VALDMAN-ORD-0001')"
            },
            "items": {
                "type": "array",
                "description": "The complete updated list of items (replaces the existing items)",
                "items": {
                    "type": "object",
                    "properties": {
                        "product_name": {
                            "type": "string",
                            "description": "Name of the product"
                        },
                        "quantity": {
                            "type": "string",
                            "description": "Quantity (e.g., '2kg', '3 loaves', '1 cake')"
                        },
                        "unit_price": {
                            "type": "number",
                            "description": "Price per unit in NIS"
                        },
                        "subtotal": {
                            "type": "number",
                            "description": "Total price for this item"
                        }
                    },
                    "required": ["product_name", "quantity", "unit_price", "subtotal"]
                }
            },
            "total": {
                "type": "number",
                "description": "New total order amount in NIS"
            },
            "delivery_notes": {
                "type": "string",
                "description": "Updated delivery or special instructions"
            }
        },
        "required": ["order_id", "items", "total"]
    }
}


def update_order(tenant_id: str, chat_id: str, tool_input: dict, db: Session) -> dict:
    """
    Update an existing pending order.

    Args:
        tenant_id: Tenant ID (e.g., "valdman")
        chat_id: Telegram/WhatsApp chat ID of the customer
        tool_input: Tool input with order_id, items, total, delivery_notes
        db: Database session

    Returns:
        dict: Result of the update attempt
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

    # Only pending orders can be updated
    if order.status != "pending":
        return {
            "success": False,
            "error": f"Order {order_id} cannot be updated (status: {order.status})"
        }

    # Update the order (preserve existing delivery notes if not provided)
    items = tool_input.get("items", [])
    total = tool_input.get("total", 0)
    delivery_notes = tool_input.get("delivery_notes") or order.delivery_notes

    order_repo.update_order(order_id, items, total, delivery_notes)

    items_str = ", ".join([f"{i['quantity']} {i['product_name']}" for i in items])
    notes_str = f" | notes={delivery_notes}" if delivery_notes else ""
    print(f"[Live][Tool] update_order → {order_id} | {items_str} | total={total} NIS{notes_str}")

    return {
        "success": True,
        "order_id": order_id,
        "message": f"Order {order_id} updated successfully"
    }
