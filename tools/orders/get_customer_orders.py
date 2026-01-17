"""
Get Customer Orders Tool

Retrieves all orders for the current customer.
This tool allows the agent to access order history when customers ask about their orders.
"""

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


def get_customer_orders(chat_id: int, orders_db: dict) -> list:
    """
    Retrieve all orders for a specific customer.

    Args:
        chat_id: Telegram chat ID of the customer
        orders_db: The orders dictionary from main.py

    Returns:
        list: List of orders for this customer
    """
    customer_orders = [
        order for order in orders_db.values()
        if order['chat_id'] == chat_id
    ]
    return customer_orders
