"""
Order model - represents customer orders.
"""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from storage.database import Base


class Order(Base):
    """
    Order belongs to a tenant and a customer.
    Stores order details (items, total, status).
    """
    __tablename__ = "orders"

    id = Column(String, primary_key=True)  # e.g., "ORD-0001"
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    # Order data
    items = Column(JSON, nullable=False)  # Array of {product_name, quantity, unit_price, subtotal}
    total = Column(Float, nullable=False)
    delivery_notes = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")

    def __repr__(self):
        return f"<Order(id='{self.id}', total={self.total}, status='{self.status}')>"
