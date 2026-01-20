"""
Create Order Tool

Creates a new order for the customer with structured data.
"""

from sqlalchemy.orm import Session
from storage.repositories import OrderRepository, CustomerRepository

# Tool definition for Claude API
TOOL_DEF = {
    "name": "create_order",
    "description": "Creates a new order for the customer. Use this after confirming all order details with the customer.",
    "input_schema": {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "description": "List of items in the order",
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
                "description": "Total order amount in NIS"
            },
            "delivery_notes": {
                "type": "string",
                "description": "Any delivery or special instructions from customer"
            }
        },
        "required": ["items", "total"]
    }
}


def create_order(tenant_id: str, chat_id: str, tool_input: dict, db: Session) -> dict:
    """
    Create and store a new order in the database.

    Args:
        tenant_id: Tenant ID (e.g., "valdman")
        chat_id: Telegram/WhatsApp chat ID of the customer
        tool_input: Order data from the tool call
        db: Database session

    Returns:
        dict: Created order object with order_id
    """
    # Get or create customer
    customer_repo = CustomerRepository(db)
    customer = customer_repo.get_or_create_by_chat_id(tenant_id, chat_id)

    # Generate order ID and create order
    order_repo = OrderRepository(db)
    order_id = order_repo.generate_order_id(tenant_id)

    order = order_repo.create(
        order_id=order_id,
        tenant_id=tenant_id,
        customer_id=customer.id,
        items=tool_input.get("items", []),
        total=tool_input.get("total", 0),
        delivery_notes=tool_input.get("delivery_notes"),
    )

    # Log order to console for visibility
    print(f"\n{'='*50}")
    print(f"NEW ORDER CREATED: {order.id}")
    print(f"Customer: {customer.chat_id} (ID: {customer.id})")
    print(f"Tenant: {tenant_id}")
    print(f"Items: {len(order.items)} items")
    for item in order.items:
        print(f"  - {item['quantity']} {item['product_name']} @ {item['unit_price']} NIS = {item['subtotal']} NIS")
    print(f"Total: {order.total} NIS")
    if order.delivery_notes:
        print(f"Notes: {order.delivery_notes}")
    print(f"Status: {order.status}")
    print(f"{'='*50}\n")

    return {
        "success": True,
        "order_id": order.id,
        "message": f"Order {order.id} created successfully"
    }
