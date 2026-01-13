"""
Joanna's Bakery configuration - artisan bakery and pastry shop.
This config will be used to generate the sales agent's system prompt and behavior.
"""

# Company information
COMPANY_NAME = "Joanna's Bakery"
COMPANY_TYPE = "artisan bakery and pastry shop"

# Business description
BUSINESS_DESCRIPTION = """We bake fresh bread, pastries, and cakes daily using traditional recipes and premium ingredients.
We serve both individual customers and provide catering services for events and businesses."""

# Agent personality and tone
AGENT_ROLE = "warm and welcoming bakery assistant"
TONE = "cheerful, warm"

# Agent instructions
AGENT_INSTRUCTIONS = """Your role:
- Help customers discover our fresh-baked goods
- Share information about our breads, pastries, and cakes
- Assist with individual orders and catering requests
- Be warm, cheerful, and passionate about our baked goods
- Always respond in the customer's language

Keep responses friendly and enthusiastic. Share the love of fresh-baked goods, not just sales."""

# Product catalog
PRODUCTS = [
    {
        "name": "Sourdough Bread",
        "category": "Breads",
        "price": "28 NIS/loaf",
        "description": "Classic artisan sourdough with crispy crust and tangy flavor",
        "available": True
    },
    {
        "name": "Whole Wheat Challah",
        "category": "Breads",
        "price": "32 NIS/loaf",
        "description": "Traditional braided challah made with whole wheat flour",
        "available": True
    },
    {
        "name": "Baguette",
        "category": "Breads",
        "price": "18 NIS/each",
        "description": "French-style baguette, baked fresh twice daily",
        "available": True
    },
    {
        "name": "Chocolate Croissant",
        "category": "Pastries",
        "price": "15 NIS/each",
        "description": "Buttery croissant filled with premium dark chocolate",
        "available": True
    },
    {
        "name": "Almond Croissant",
        "category": "Pastries",
        "price": "16 NIS/each",
        "description": "Flaky croissant with almond cream and sliced almonds",
        "available": True
    },
    {
        "name": "Cinnamon Roll",
        "category": "Pastries",
        "price": "14 NIS/each",
        "description": "Soft, gooey cinnamon roll with cream cheese frosting",
        "available": True
    },
    {
        "name": "Chocolate Cake",
        "category": "Cakes",
        "price": "180 NIS/whole cake",
        "description": "Rich triple-layer chocolate cake with ganache frosting",
        "available": True
    },
    {
        "name": "Lemon Tart",
        "category": "Cakes",
        "price": "120 NIS/tart",
        "description": "Tangy lemon curd in buttery shortcrust pastry",
        "available": True
    },
    {
        "name": "Cheesecake",
        "category": "Cakes",
        "price": "160 NIS/whole cake",
        "description": "New York style cheesecake with graham cracker crust",
        "available": True
    },
    {
        "name": "Apple Strudel",
        "category": "Pastries",
        "price": "22 NIS/slice",
        "description": "Traditional apple strudel with cinnamon and raisins",
        "available": True
    }
]
