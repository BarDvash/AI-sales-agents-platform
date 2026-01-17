"""
Create Order Tool

Creates a new order for the customer with structured data.
"""

import datetime

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


def create_order(chat_id: int, tool_input: dict, orders_db: dict, order_counter: dict) -> dict:
    """
    Create and store a new order with structured data.

    Args:
        chat_id: Telegram chat ID of the customer
        tool_input: Order data from the tool call
        orders_db: The orders dictionary from main.py
        order_counter: Dictionary with 'value' key for counter (passed by reference)

    Returns:
        dict: Created order object with order_id
    """
    # Increment order counter
    order_counter['value'] += 1

    order_id = f"ORD-{order_counter['value']:04d}"
    order = {
        "order_id": order_id,
        "chat_id": chat_id,
        "items": tool_input.get("items", []),
        "total": tool_input.get("total", 0),
        "delivery_notes": tool_input.get("delivery_notes", ""),
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "pending"
    }

    orders_db[order_id] = order

    # Log order to console for visibility
    print(f"\n{'='*50}")
    print(f"NEW ORDER CREATED: {order_id}")
    print(f"Customer: {chat_id}")
    print(f"Items: {len(order['items'])} items")
    for item in order['items']:
        print(f"  - {item['quantity']} {item['product_name']} @ {item['unit_price']} NIS = {item['subtotal']} NIS")
    print(f"Total: {order['total']} NIS")
    if order['delivery_notes']:
        print(f"Notes: {order['delivery_notes']}")
    print(f"Time: {order['timestamp']}")
    print(f"{'='*50}\n")

    return {
        "success": True,
        "order_id": order_id,
        "message": f"Order {order_id} created successfully"
    }
