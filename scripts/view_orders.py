"""
View orders script.
Displays all orders from the database with details.

Run this to check if orders are being saved:
    python scripts/view_orders.py
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from storage.database import SessionLocal
from storage.models.order import Order
from storage.models.customer import Customer

# Load environment variables
load_dotenv()


def view_orders():
    """Display all orders from the database."""
    db = SessionLocal()

    try:
        # Get all orders
        orders = db.query(Order).all()

        if not orders:
            print("\n" + "="*60)
            print("No orders found in the database.")
            print("="*60)
            return

        print("\n" + "="*60)
        print(f"Total Orders: {len(orders)}")
        print("="*60)

        for order in orders:
            # Get customer info
            customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
            customer_name = customer.name if customer else "Unknown"
            customer_phone = customer.phone if customer else "N/A"

            print(f"\nOrder ID: {order.id}")
            print(f"Customer: {customer_name} (Phone: {customer_phone})")
            print(f"Status: {order.status}")
            print(f"Total: {order.total} NIS")
            print(f"Delivery Notes: {order.delivery_notes or 'None'}")
            print(f"Created: {order.created_at}")

            # Display items
            if order.items:
                print("Items:")
                for item in order.items:
                    print(f"  - {item['product_name']}: {item['quantity']} {item.get('unit', 'kg')} @ {item.get('price_per_unit', item.get('unit_price', 'N/A'))} NIS/{item.get('unit', 'kg')}")

            print("-" * 60)

        print("\n")

    except Exception as e:
        print(f"Error viewing orders: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    view_orders()
