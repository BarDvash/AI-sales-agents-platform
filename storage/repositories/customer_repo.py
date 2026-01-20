"""
Customer Repository - manages customer data access.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from storage.models.customer import Customer


class CustomerRepository:
    """Repository for Customer operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        """Get customer by ID."""
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_by_chat_id(self, chat_id: str) -> Optional[Customer]:
        """Get customer by chat_id (Telegram/WhatsApp ID)."""
        return self.db.query(Customer).filter(Customer.chat_id == chat_id).first()

    def get_or_create_by_chat_id(self, tenant_id: str, chat_id: str) -> Customer:
        """
        Get existing customer or create new one.
        Used when new user messages the bot.
        """
        customer = self.get_by_chat_id(chat_id)
        if not customer:
            customer = Customer(
                tenant_id=tenant_id,
                chat_id=chat_id,
            )
            self.db.add(customer)
            self.db.commit()
            self.db.refresh(customer)
        return customer

    def update_profile(
        self,
        customer: Customer,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        preferences: Optional[str] = None,
    ) -> Customer:
        """Update customer profile information."""
        if name is not None:
            customer.name = name
        if phone is not None:
            customer.phone = phone
        if email is not None:
            customer.email = email
        if preferences is not None:
            customer.preferences = preferences

        self.db.commit()
        self.db.refresh(customer)
        return customer

    def get_by_tenant(self, tenant_id: str) -> List[Customer]:
        """Get all customers for a tenant."""
        return self.db.query(Customer).filter(Customer.tenant_id == tenant_id).all()
