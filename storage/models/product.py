"""
Product model - represents items sold by tenants.
"""
from sqlalchemy import Column, String, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from storage.database import Base


class Product(Base):
    """
    Product belongs to a tenant.
    Stores product catalog (name, price, description, category).
    """
    __tablename__ = "products"

    id = Column(String, primary_key=True)  # e.g., "valdman_ribeye_steak"
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    # Product details
    name = Column(String, nullable=False)  # e.g., "Premium Ribeye Steak"
    category = Column(String, nullable=False)  # e.g., "Beef"
    price = Column(Float, nullable=False)  # Numeric price (e.g., 45.0)
    unit = Column(String, default="kg", nullable=False)  # e.g., "kg", "piece", "liter"
    description = Column(Text, nullable=False)
    available = Column(Boolean, default=True)

    # Relationship
    tenant = relationship("Tenant", back_populates="products")

    def __repr__(self):
        return f"<Product(id='{self.id}', name='{self.name}', price={self.price})>"
