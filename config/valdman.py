"""
Valdman configuration - meat and sausage factory.
This config will be used to generate the sales agent's system prompt and behavior.
"""

# Company information
COMPANY_NAME = "Valdman"
COMPANY_TYPE = "meat and sausage factory"

# Business description
BUSINESS_DESCRIPTION = """We produce fresh sausages and quality meat products.
We have our own retail stores and also supply products to other stores and businesses."""

# Agent personality and tone
AGENT_ROLE = "friendly sales representative"
TONE = "natural, friendly"

# Agent instructions
AGENT_INSTRUCTIONS = """Your role:
- Help customers learn about our products
- Answer questions about our meat and sausages
- Assist both retail customers and wholesale buyers
- Be natural, friendly, and helpful
- Always respond in the customer's language

Keep responses warm and conversational. You're here to help, not to push sales."""

# Product catalog
PRODUCTS = [
    {
        "name": "Classic Beef Sausage",
        "category": "Sausages",
        "price": "45 NIS/kg",
        "description": "Traditional beef sausage with authentic spices, perfect for grilling",
        "available": True
    },
    {
        "name": "Spicy Merguez",
        "category": "Sausages",
        "price": "52 NIS/kg",
        "description": "North African style lamb sausage with harissa and cumin",
        "available": True
    },
    {
        "name": "Chicken & Herb Sausage",
        "category": "Sausages",
        "price": "38 NIS/kg",
        "description": "Light chicken sausage with fresh herbs and garlic",
        "available": True
    },
    {
        "name": "Premium Ribeye Steak",
        "category": "Fresh Meat",
        "price": "120 NIS/kg",
        "description": "Prime cut ribeye, aged 21 days for perfect tenderness",
        "available": True
    },
    {
        "name": "Ground Beef (80/20)",
        "category": "Fresh Meat",
        "price": "55 NIS/kg",
        "description": "Fresh ground beef, ideal for burgers and meatballs",
        "available": True
    },
    {
        "name": "Chicken Breast Fillets",
        "category": "Fresh Meat",
        "price": "42 NIS/kg",
        "description": "Skinless, boneless chicken breast fillets",
        "available": True
    },
    {
        "name": "Lamb Chops",
        "category": "Fresh Meat",
        "price": "95 NIS/kg",
        "description": "Premium lamb chops, perfect for special occasions",
        "available": True
    },
    {
        "name": "Smoked Turkey Breast",
        "category": "Deli Meat",
        "price": "68 NIS/kg",
        "description": "Hickory-smoked turkey breast, sliced to order",
        "available": True
    },
    {
        "name": "Pastrami",
        "category": "Deli Meat",
        "price": "75 NIS/kg",
        "description": "House-made pastrami with secret spice blend",
        "available": True
    },
    {
        "name": "Italian Salami",
        "category": "Deli Meat",
        "price": "82 NIS/kg",
        "description": "Authentic Italian-style dry salami with wine and pepper",
        "available": True
    }
]
