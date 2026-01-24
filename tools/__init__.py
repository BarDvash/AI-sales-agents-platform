"""
Tools module for agent function calling.
Organizes tools by domain (orders, products, customers, etc.).
"""

from .orders import (
    create_order,
    CREATE_ORDER_DEF,
    get_customer_orders,
    GET_CUSTOMER_ORDERS_DEF,
    cancel_order,
    CANCEL_ORDER_DEF,
    update_order,
    UPDATE_ORDER_DEF,
)

# Collect all tool definitions for Claude API
TOOL_DEFINITIONS = [
    GET_CUSTOMER_ORDERS_DEF,
    CREATE_ORDER_DEF,
    CANCEL_ORDER_DEF,
    UPDATE_ORDER_DEF,
]


def execute_tool(tool_name: str, tool_input: dict, tenant_id: str, chat_id: str, db, config=None):
    """
    Execute a tool by name and return the result.

    Args:
        tool_name: Name of the tool to execute
        tool_input: Input parameters for the tool
        tenant_id: Tenant identifier (e.g., "valdman")
        chat_id: Current customer's chat ID
        db: Database session
        config: Tenant configuration (for future tools)

    Returns:
        Tool execution result
    """
    if tool_name == "get_customer_orders":
        return get_customer_orders(tenant_id, chat_id, db)

    elif tool_name == "create_order":
        return create_order(tenant_id, chat_id, tool_input, db)

    elif tool_name == "cancel_order":
        return cancel_order(tenant_id, chat_id, tool_input, db)

    elif tool_name == "update_order":
        return update_order(tenant_id, chat_id, tool_input, db)

    else:
        return {"error": f"Unknown tool: {tool_name}"}
