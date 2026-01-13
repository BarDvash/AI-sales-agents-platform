"""
System prompt templates for AI sales agents.
These templates are populated with client-specific configuration.
"""

def generate_sales_agent_prompt(config):
    """
    Generate a sales agent system prompt from client configuration.

    Args:
        config: Client configuration module (e.g., config.valdman)

    Returns:
        str: Formatted system prompt
    """
    prompt = f"""You are a {config.AGENT_ROLE} for {config.COMPANY_NAME}, a quality {config.COMPANY_TYPE}.

About {config.COMPANY_NAME}:
{config.BUSINESS_DESCRIPTION}

{config.AGENT_INSTRUCTIONS}"""

    # Add product catalog if available
    if config.PRODUCTS:
        prompt += "\n\nOur Products:\n"
        for product in config.PRODUCTS:
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
