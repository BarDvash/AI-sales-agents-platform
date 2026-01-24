"""
Order Repository - manages order data access.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from storage.models.order import Order


class OrderRepository:
    """Repository for Order operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: str) -> Optional[Order]:
        """Get order by ID."""
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_by_customer(self, customer_id: int) -> List[Order]:
        """Get all orders for a customer."""
        return (
            self.db.query(Order)
            .filter(Order.customer_id == customer_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def get_by_tenant(self, tenant_id: str) -> List[Order]:
        """Get all orders for a tenant."""
        return (
            self.db.query(Order)
            .filter(Order.tenant_id == tenant_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def create(
        self,
        order_id: str,
        tenant_id: str,
        customer_id: int,
        items: list,
        total: float,
        delivery_notes: Optional[str] = None,
    ) -> Order:
        """Create new order."""
        order = Order(
            id=order_id,
            tenant_id=tenant_id,
            customer_id=customer_id,
            items=items,
            total=total,
            delivery_notes=delivery_notes,
            status="pending",
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_status(self, order_id: str, new_status: str) -> Optional[Order]:
        """
        Update order status.
        Valid statuses: pending, confirmed, completed, cancelled
        """
        order = self.get_by_id(order_id)
        if order:
            order.status = new_status
            self.db.commit()
            self.db.refresh(order)
        return order

    def update_order(self, order_id: str, items: list, total: float, delivery_notes: Optional[str] = None) -> Optional[Order]:
        """Update order items, total, and delivery notes."""
        order = self.get_by_id(order_id)
        if order:
            order.items = items
            order.total = total
            order.delivery_notes = delivery_notes
            self.db.commit()
            self.db.refresh(order)
        return order

    def get_pending_orders(self, tenant_id: str) -> List[Order]:
        """Get all pending orders for a tenant."""
        return (
            self.db.query(Order)
            .filter(Order.tenant_id == tenant_id, Order.status == "pending")
            .order_by(Order.created_at.desc())
            .all()
        )

    def generate_order_id(self, tenant_id: str) -> str:
        """
        Generate next order ID for tenant.
        Format: VALDMAN-ORD-0001, JOANNAS_BAKERY-ORD-0001, etc.
        """
        # Get count of orders for this tenant
        count = self.db.query(Order).filter(Order.tenant_id == tenant_id).count()
        # Include tenant prefix to ensure uniqueness across tenants
        tenant_prefix = tenant_id.upper().replace('_', '-')
        return f"{tenant_prefix}-ORD-{count + 1:04d}"
