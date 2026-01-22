"""
Conversation summarizer - creates summaries of older messages to extend agent memory.
"""
import os
from typing import List, Optional
from anthropic import AsyncAnthropic

# Use the same client setup as orchestrator
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

# Configuration
MESSAGE_BATCH_SIZE = 15  # Summarize every N messages
MEMORY_SIZE = 30         # Keep last N messages in context (2 batches)


async def generate_conversation_summary(
    messages: List[dict],
    existing_summary: Optional[str] = None
) -> str:
    """
    Generate a summary of conversation messages.

    Args:
        messages: List of messages to summarize [{"role": "user", "content": "..."}]
        existing_summary: Previous summary to build upon (if any)

    Returns:
        A concise summary of the conversation
    """
    if not messages:
        return existing_summary or ""

    # Format messages for the summarization prompt
    formatted_messages = "\n".join([
        f"{msg['role'].upper()}: {msg['content']}"
        for msg in messages
    ])

    # Build the summarization prompt
    if existing_summary:
        prompt = f"""You are summarizing a sales conversation to help maintain context.

PREVIOUS SUMMARY:
{existing_summary}

NEW MESSAGES TO INCORPORATE:
{formatted_messages}

Create an updated summary that:
1. Preserves key customer information (name, preferences, past requests)
2. Notes any orders discussed or placed
3. Captures important decisions or commitments made
4. Keeps track of any pending questions or open items

Keep the summary concise (3-5 sentences max). Focus on facts useful for continuing the conversation."""
    else:
        prompt = f"""You are summarizing a sales conversation to help maintain context.

CONVERSATION:
{formatted_messages}

Create a summary that:
1. Captures key customer information (name, preferences, requests)
2. Notes any orders discussed or placed
3. Records important decisions or commitments made
4. Tracks any pending questions or open items

Keep the summary concise (3-5 sentences max). Focus on facts useful for continuing the conversation."""

    response = await anthropic_client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text


def should_summarize(message_count: int, last_summary_at: Optional[int]) -> bool:
    """
    Determine if we should trigger summarization.

    Summarize every MESSAGE_BATCH_SIZE messages (15, 30, 45, 60...).

    Args:
        message_count: Total messages in conversation (keeps growing)
        last_summary_at: Message count when we last summarized (None if never)

    Examples with MESSAGE_BATCH_SIZE=15:
    - 14 msgs: False
    - 15 msgs, never summarized: True
    - 15 msgs, last at 15: False
    - 29 msgs, last at 15: False
    - 30 msgs, last at 15: True
    """
    if message_count < MESSAGE_BATCH_SIZE:
        return False

    if last_summary_at is None:
        # First summary at 15 messages
        return message_count >= MESSAGE_BATCH_SIZE

    # Summarize every 15 messages
    return message_count - last_summary_at >= MESSAGE_BATCH_SIZE


def get_messages_to_summarize(messages: List[dict]) -> List[dict]:
    """
    Get the latest batch of messages to summarize.

    When we hit 15, 30, 45... messages, we summarize the most recent 15.
    These get added to the rolling summary.
    """
    if len(messages) < MESSAGE_BATCH_SIZE:
        return []

    # Take the latest batch (last 15 messages)
    return messages[-MESSAGE_BATCH_SIZE:]
