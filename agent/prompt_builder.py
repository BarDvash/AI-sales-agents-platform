"""
System prompt builder - constructs dynamic prompts from tenant configuration.
"""
from typing import Optional, List


def build_system_prompt(
    tenant_config,
    conversation_summary: Optional[str] = None,
    customer_context: Optional[str] = None,
    tool_definitions: Optional[List[dict]] = None
):
    """
    Build a system prompt from tenant configuration.

    Args:
        tenant_config: Tenant configuration with COMPANY_NAME, PRODUCTS, AGENT_ROLE, etc.
        conversation_summary: Optional summary of earlier conversation for extended memory.
        customer_context: Optional customer profile and order history context.

    Returns:
        str: Formatted system prompt for the LLM
    """
    prompt = f"""You are a {tenant_config.AGENT_ROLE} for {tenant_config.COMPANY_NAME}, a quality {tenant_config.COMPANY_TYPE}.

About {tenant_config.COMPANY_NAME}:
{tenant_config.BUSINESS_DESCRIPTION}

{tenant_config.AGENT_INSTRUCTIONS}"""

    # Add product catalog if available
    if tenant_config.PRODUCTS:
        prompt += "\n\nOur Products:\n"
        for product in tenant_config.PRODUCTS:
            prompt += f"\n- {product['name']} ({product['category']})"
            prompt += f"\n  Price: {product['price']}"
            prompt += f"\n  {product['description']}"
            if not product.get('available', True):
                prompt += "\n  (Currently unavailable)"

    # Add tool usage and order workflow instructions
    prompt += """

Order Taking Process:
When a customer wants to place an order:
1. Discuss the products they want and confirm quantities
2. Calculate and show the total price clearly
3. Ask for any delivery notes or special instructions
4. Once the customer confirms everything, use the create_order tool to finalize the order
5. Provide the order ID to the customer after the order is created

Order Cancellation:
When a customer wants to cancel an order:
1. If they don't specify which order, use get_customer_orders to find their pending orders and ask which one
2. Once you know the order_id, call the cancel_order tool IMMEDIATELY - the tool handles validation
3. Only pending orders can be cancelled - the tool will return an error if the order can't be cancelled

Order Update:
When a customer wants to modify an existing order (add/remove items, change quantities):
1. Use get_customer_orders to find the order if needed
2. Discuss the changes with the customer and confirm the updated items and total
3. Call update_order with the COMPLETE updated items list and new total - this replaces the entire order contents
4. Only pending orders can be updated"""

    # Auto-generate Available Tools from TOOL_DEFINITIONS
    if tool_definitions:
        prompt += "\n\nAvailable Tools:"
        for tool_def in tool_definitions:
            prompt += f"\n- {tool_def['name']}: {tool_def['description']}"

    prompt += """

CRITICAL RULE: You MUST call the appropriate tool to perform any action. You are FORBIDDEN from telling the customer that an order was created, cancelled, or modified unless you have actually called the corresponding tool and received a success response. If you do not call the tool, the action did NOT happen. Be friendly and helpful!"""

    # Add customer profile context if available
    if customer_context:
        prompt += f"""

Known Customer Information:
{customer_context}

Use this information to personalize the conversation. Address the customer by name if known. Reference their preferences and past orders when relevant."""

    # Add conversation summary if available (for extended memory)
    if conversation_summary:
        prompt += f"""

Conversation Context (summary of earlier messages):
{conversation_summary}

Use this context to maintain continuity. The customer may reference things discussed earlier."""

    return prompt
