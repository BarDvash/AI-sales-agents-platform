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

    return prompt
