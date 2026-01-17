"""
Tools module for agent function calling.
Organizes tools by domain (orders, products, customers, etc.).
"""

from .orders import (
    create_order,
    CREATE_ORDER_DEF,
    get_customer_orders,
    GET_CUSTOMER_ORDERS_DEF,
)

# Collect all tool definitions for Claude API
TOOL_DEFINITIONS = [
    GET_CUSTOMER_ORDERS_DEF,
    CREATE_ORDER_DEF,
]


def execute_tool(tool_name: str, tool_input: dict, chat_id: int, orders_db: dict, order_counter: dict = None, config=None):
    """
    Execute a tool by name and return the result.

    Args:
        tool_name: Name of the tool to execute
        tool_input: Input parameters for the tool
        chat_id: Current customer's chat ID
        orders_db: Reference to orders dictionary
        order_counter: Dictionary with 'value' key for order counter (for create_order)
        config: Tenant configuration (for future tools)

    Returns:
        Tool execution result
    """
    if tool_name == "get_customer_orders":
        return get_customer_orders(chat_id, orders_db)

    elif tool_name == "create_order":
        if order_counter is None:
            return {"error": "order_counter is required for create_order"}
        return create_order(chat_id, tool_input, orders_db, order_counter)

    else:
        return {"error": f"Unknown tool: {tool_name}"}
