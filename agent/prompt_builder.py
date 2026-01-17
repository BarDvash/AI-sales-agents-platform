"""
System prompt builder - constructs dynamic prompts from tenant configuration.
"""


def build_system_prompt(tenant_config):
    """
    Build a system prompt from tenant configuration.

    Args:
        tenant_config: Tenant configuration with COMPANY_NAME, PRODUCTS, AGENT_ROLE, etc.

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

    # Add tool usage and order-taking instructions
    prompt += """

Order Taking Process:
When a customer wants to place an order:
1. Discuss the products they want and confirm quantities
2. Calculate and show the total price clearly
3. Ask for any delivery notes or special instructions
4. Once the customer confirms everything, use the create_order tool to finalize the order
5. Provide the order ID to the customer after the order is created

Available Tools:
- get_customer_orders: Retrieve a customer's previous orders when they ask about them
- create_order: Create a new order with structured data (items, quantities, prices, total)

Important: Always use the create_order tool to finalize orders. Be friendly and helpful!"""

    return prompt
