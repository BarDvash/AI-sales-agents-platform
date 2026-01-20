"""
Customer model - represents end users (people buying from tenants).
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from storage.database import Base


class Customer(Base):
    """
    Customer belongs to a tenant.
    Identified by chat_id from messaging platform.
    """
    __tablename__ = "customers"
    __table_args__ = (
        UniqueConstraint('tenant_id', 'chat_id', name='uq_tenant_chat'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    # Messaging platform identifier
    chat_id = Column(String, nullable=False)  # e.g., Telegram chat_id

    # Optional customer info (collected over time)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string of preferences

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="customers")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Customer(id={self.id}, chat_id='{self.chat_id}', tenant='{self.tenant_id}')>"
