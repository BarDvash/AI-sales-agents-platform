"""
Product Repository - manages product catalog.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from storage.models.product import Product


class ProductRepository:
    """Repository for Product operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID."""
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_by_tenant(self, tenant_id: str, available_only: bool = True) -> List[Product]:
        """
        Get all products for a tenant.
        By default, only returns available products.
        """
        query = self.db.query(Product).filter(Product.tenant_id == tenant_id)
        if available_only:
            query = query.filter(Product.available == True)
        return query.all()

    def get_by_category(self, tenant_id: str, category: str) -> List[Product]:
        """Get products by category for a tenant."""
        return (
            self.db.query(Product)
            .filter(
                Product.tenant_id == tenant_id,
                Product.category == category,
                Product.available == True,
            )
            .all()
        )

    def create(
        self,
        product_id: str,
        tenant_id: str,
        name: str,
        category: str,
        price: float,
        description: str,
        available: bool = True,
        unit: str = "kg",
    ) -> Product:
        """Create new product."""
        product = Product(
            id=product_id,
            tenant_id=tenant_id,
            name=name,
            category=category,
            price=price,
            unit=unit,
            description=description,
            available=available,
        )
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_availability(self, product_id: str, available: bool) -> Optional[Product]:
        """Update product availability."""
        product = self.get_by_id(product_id)
        if product:
            product.available = available
            self.db.commit()
            self.db.refresh(product)
        return product

    def update_price(self, product_id: str, new_price: float) -> Optional[Product]:
        """Update product price."""
        product = self.get_by_id(product_id)
        if product:
            product.price = new_price
            self.db.commit()
            self.db.refresh(product)
        return product
