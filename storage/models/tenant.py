"""
Tenant model - represents a business using the platform.
"""
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from storage.database import Base


class Tenant(Base):
    """
    Tenant = Business customer (e.g., Valdman, Joanna's Bakery).

    Each tenant has:
    - Unique identifier
    - Business information
    - Agent configuration
    - Products, orders, customers (relationships)
    """
    __tablename__ = "tenants"

    # Primary key
    id = Column(String, primary_key=True)  # e.g., "valdman"

    # Business info
    company_name = Column(String, nullable=False)  # e.g., "Valdman"
    company_type = Column(String, nullable=False)  # e.g., "butcher shop"
    business_description = Column(Text, nullable=False)

    # Agent configuration
    agent_role = Column(String, nullable=False)  # e.g., "sales representative"
    agent_instructions = Column(Text, nullable=False)

    # Telegram configuration
    bot_token = Column(String, nullable=True)  # Telegram bot token

    # Business settings
    currency = Column(String, default="NIS", nullable=False)  # e.g., "NIS", "USD", "EUR"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (defined later after creating other models)
    products = relationship("Product", back_populates="tenant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tenant(id='{self.id}', company_name='{self.company_name}')>"
