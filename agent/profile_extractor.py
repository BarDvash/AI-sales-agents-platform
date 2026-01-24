"""
Profile extractor - automatically extracts customer profile information from conversations.

Self-contained module that handles:
- When to extract (frequency logic)
- How many messages to analyze (context window)
- LLM-based extraction with per-field behavior
- Saving extracted data to database

Design:
- Runs every EXTRACT_EVERY messages (not every message, to save cost)
- Analyzes the last CONTEXT_WINDOW messages (for multi-turn context)
- All fields update to latest value (null = keep existing)
- Notes are consolidated (merged with existing, deduplicated, kept concise)
"""
import os
import json
from typing import Optional, List
from dataclasses import dataclass
from anthropic import AsyncAnthropic
from storage.database import get_db
from storage.repositories import CustomerRepository

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

# Configuration
EXTRACT_EVERY = 5       # Run extraction every N messages
CONTEXT_WINDOW = 10     # Analyze the last N messages


@dataclass
class ExtractedProfile:
    """Structured profile data extracted from conversation."""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None
    notes: Optional[str] = None

    def has_any_data(self) -> bool:
        """Check if any profile data was extracted."""
        return any([
            self.name, self.phone, self.email,
            self.address, self.language, self.notes
        ])

    def to_dict(self) -> dict:
        """Convert to dictionary, excluding None values."""
        return {k: v for k, v in {
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'language': self.language,
            'notes': self.notes,
        }.items() if v is not None}


def should_extract(total_msgs: int) -> bool:
    """
    Determine if profile extraction should run.
    Runs every EXTRACT_EVERY messages.
    """
    return total_msgs > 0 and total_msgs % EXTRACT_EVERY == 0


def _format_messages_for_prompt(messages: List[dict]) -> str:
    """Format conversation messages for the extraction prompt."""
    lines = []
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        if isinstance(content, list):
            # Handle structured content (tool results, etc.) - skip these
            continue
        label = "CUSTOMER" if role == "user" else "AGENT"
        lines.append(f"[{label}]: {content}")
    return "\n".join(lines)


def _build_extraction_prompt(messages: List[dict], existing_profile: dict) -> str:
    """Build the LLM prompt for profile extraction."""
    conversation_text = _format_messages_for_prompt(messages)

    existing_info = ""
    existing_parts = []
    if existing_profile.get('name'):
        existing_parts.append(f"Name: {existing_profile['name']}")
    if existing_profile.get('phone'):
        existing_parts.append(f"Phone: {existing_profile['phone']}")
    if existing_profile.get('email'):
        existing_parts.append(f"Email: {existing_profile['email']}")
    if existing_profile.get('address'):
        existing_parts.append(f"Address: {existing_profile['address']}")
    if existing_profile.get('language'):
        existing_parts.append(f"Language: {existing_profile['language']}")
    if existing_profile.get('notes'):
        existing_parts.append(f"Notes: {existing_profile['notes']}")
    if existing_parts:
        existing_info = "CURRENT PROFILE:\n" + "\n".join(existing_parts) + "\n\n"

    return f"""Extract customer profile information from this conversation.
The messages are labeled [CUSTOMER] and [AGENT]. Only extract information about the CUSTOMER (not the agent/business).

{existing_info}CONVERSATION:
{conversation_text}

For each field, follow these rules:
- name: Extract if the customer states or corrects their name. Use null if no name is mentioned.
- phone: Extract the latest phone number the customer mentions. Use null if none mentioned.
- email: Extract the latest email the customer mentions. Use null if none mentioned.
- address: Extract the latest address or delivery location the customer mentions. Use null if none mentioned.
- language: Detect the language the customer is writing in (Hebrew, English, Russian, etc.). Use null if unclear.
- notes: Extract any preferences, dietary restrictions, allergies, or special requests. If there are existing notes, consolidate them with any new information into a concise summary (remove duplicates, keep all important facts). Use null if nothing relevant found.

Respond with valid JSON only. Use null for fields where no information is found in this conversation.
Example: {{"name": "David", "phone": null, "email": null, "address": "123 Main St", "language": "Hebrew", "notes": "allergic to nuts, prefers delivery after 6pm"}}

JSON:"""


async def _extract_from_messages(messages: List[dict], existing_profile: dict) -> Optional[ExtractedProfile]:
    """
    Run LLM extraction on a list of messages.

    Args:
        messages: Conversation messages (last CONTEXT_WINDOW messages)
        existing_profile: Current profile data for context

    Returns:
        ExtractedProfile with discovered information, or None if nothing found
    """
    prompt = _build_extraction_prompt(messages, existing_profile)

    try:
        response = await anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )

        result_text = response.content[0].text.strip()

        # Handle potential markdown code blocks
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1])

        data = json.loads(result_text)

        profile = ExtractedProfile(
            name=data.get('name'),
            phone=data.get('phone'),
            email=data.get('email'),
            address=data.get('address'),
            language=data.get('language'),
            notes=data.get('notes'),
        )

        if profile.has_any_data():
            return profile
        return None

    except (json.JSONDecodeError, KeyError) as e:
        print(f"Profile extraction JSON error: {e}")
        return None
    except Exception as e:
        print(f"Profile extraction error: {e}")
        return None


async def extract_and_save(
    tenant_id: str,
    chat_id: str,
    conversation_history: List[dict]
) -> None:
    """
    Main entry point: extract profile from recent messages and save to database.
    Runs as a background task - gets its own DB session.

    Args:
        tenant_id: Tenant identifier
        chat_id: Customer's chat ID
        conversation_history: Full conversation history (will be sliced to CONTEXT_WINDOW)
    """
    db_gen = get_db()
    db = next(db_gen)
    try:
        customer_repo = CustomerRepository(db)
        customer = customer_repo.get_by_chat_id(tenant_id, chat_id)
        if not customer:
            return

        # Get existing profile for context
        existing_profile = {
            'name': customer.name,
            'phone': customer.phone,
            'email': customer.email,
            'address': customer.address,
            'language': customer.language,
            'notes': customer.notes,
        }

        # Slice to context window
        messages = conversation_history[-CONTEXT_WINDOW:]

        extracted = await _extract_from_messages(messages, existing_profile)

        if extracted:
            print(f"Profile extracted: {extracted.to_dict()}")

            # Update profile - null fields are skipped (keep existing)
            customer_repo.update_profile(
                customer,
                name=extracted.name,
                phone=extracted.phone,
                email=extracted.email,
                address=extracted.address,
                language=extracted.language,
                notes=extracted.notes,
            )
            print(f"Customer profile updated for {chat_id}")

    except Exception as e:
        print(f"Profile extraction warning: {e}")
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass
