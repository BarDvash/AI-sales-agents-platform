"""
Conversation Repository - manages conversation and message history.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from storage.models.conversation import Conversation, Message


class ConversationRepository:
    """Repository for Conversation and Message operations."""

    def __init__(self, db: Session):
        self.db = db

    # === Conversation Operations ===

    def get_conversation_by_id(self, conversation_id: int) -> Optional[Conversation]:
        """Get conversation by ID."""
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_active_conversation(self, customer_id: int) -> Optional[Conversation]:
        """Get active conversation for customer."""
        return (
            self.db.query(Conversation)
            .filter(
                Conversation.customer_id == customer_id,
                Conversation.status == "active",
            )
            .first()
        )

    def get_or_create_active_conversation(
        self, tenant_id: str, customer_id: int
    ) -> Conversation:
        """
        Get active conversation or create new one.
        Used when customer sends a message.
        """
        conversation = self.get_active_conversation(customer_id)
        if not conversation:
            conversation = Conversation(
                tenant_id=tenant_id,
                customer_id=customer_id,
                status="active",
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        return conversation

    def update_status(self, conversation_id: int, new_status: str) -> Optional[Conversation]:
        """
        Update conversation status.
        Valid statuses: active, resolved, escalated
        """
        conversation = self.get_conversation_by_id(conversation_id)
        if conversation:
            conversation.status = new_status
            self.db.commit()
            self.db.refresh(conversation)
        return conversation

    def get_by_customer(self, customer_id: int) -> List[Conversation]:
        """Get all conversations for a customer."""
        return (
            self.db.query(Conversation)
            .filter(Conversation.customer_id == customer_id)
            .order_by(Conversation.created_at.desc())
            .all()
        )

    # === Message Operations ===

    def add_message(
        self, conversation_id: int, role: str, content: str
    ) -> Message:
        """
        Add message to conversation.
        Role: 'user' or 'assistant'
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_messages(
        self, conversation_id: int, limit: Optional[int] = None
    ) -> List[Message]:
        """
        Get messages for a conversation.
        Returns in chronological order (oldest first).
        """
        query = (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        if limit:
            query = query.limit(limit)
        return query.all()

    def get_recent_messages(
        self, conversation_id: int, limit: int = 10
    ) -> List[Message]:
        """Get most recent N messages for a conversation."""
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .all()
        )[::-1]  # Reverse to chronological order

    def get_conversation_history(self, customer_id: int) -> List[dict]:
        """
        Get full conversation history for customer as Claude-formatted messages.
        Returns: [{"role": "user", "content": "..."}, ...]
        """
        conversation = self.get_active_conversation(customer_id)
        if not conversation:
            return []

        messages = self.get_messages(conversation.id)
        return [{"role": msg.role, "content": msg.content} for msg in messages]
