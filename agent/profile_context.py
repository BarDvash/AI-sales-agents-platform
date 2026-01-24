"""
Profile context builder - formats customer profile and order history for the system prompt.
"""
from typing import Optional, List
from storage.models.customer import Customer
from storage.models.order import Order


def build_customer_context(
    customer: Customer,
    orders: Optional[List[Order]] = None
) -> Optional[str]:
    """
    Build a context string with customer profile and order history.

    Args:
        customer: Customer model instance
        orders: List of customer's orders (optional)

    Returns:
        Formatted context string for the system prompt, or None if no info available
    """
    sections = []

    # Build profile section
    profile_parts = []
    if customer.name:
        profile_parts.append(f"Name: {customer.name}")
    if customer.phone:
        profile_parts.append(f"Phone: {customer.phone}")
    if customer.email:
        profile_parts.append(f"Email: {customer.email}")
    if customer.address:
        profile_parts.append(f"Delivery Address: {customer.address}")
    if customer.language:
        profile_parts.append(f"Language: {customer.language}")
    if customer.preferences:
        profile_parts.append(f"Preferences: {customer.preferences}")
    if customer.notes:
        profile_parts.append(f"Notes: {customer.notes}")

    if profile_parts:
        sections.append("Customer Profile:\n" + "\n".join(f"- {p}" for p in profile_parts))

    # Build order history section
    if orders:
        order_lines = []
        for i, order in enumerate(orders[:5]):  # Show last 5 orders max
            items_summary = ", ".join([
                f"{item.get('quantity', 1)} {item.get('name', 'item')}"
                for item in (order.items or [])[:3]  # Max 3 items per order
            ])
            if len(order.items or []) > 3:
                items_summary += f" (+{len(order.items) - 3} more)"

            date_str = order.created_at.strftime("%b %d") if order.created_at else "Unknown"
            order_lines.append(f"- {date_str}: {items_summary} (Total: ${order.total:.2f})")

        if order_lines:
            sections.append("Order History:\n" + "\n".join(order_lines))

            # Add favorite products insight if multiple orders
            if len(orders) >= 2:
                product_counts = {}
                for order in orders:
                    for item in (order.items or []):
                        name = item.get('name', '')
                        if name:
                            product_counts[name] = product_counts.get(name, 0) + 1

                if product_counts:
                    favorites = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:3]
                    favorites_str = ", ".join([name for name, _ in favorites])
                    sections.append(f"Frequently Ordered: {favorites_str}")

    if not sections:
        return None

    return "\n\n".join(sections)
