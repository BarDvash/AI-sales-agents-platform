"""
Profile extractor - automatically extracts customer profile information from conversations.
Uses LLM to identify and extract personal details mentioned in messages.
"""
import os
import json
from typing import Optional
from dataclasses import dataclass
from anthropic import AsyncAnthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


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


async def extract_profile_from_message(
    user_message: str,
    assistant_response: str,
    existing_profile: Optional[dict] = None
) -> Optional[ExtractedProfile]:
    """
    Extract customer profile information from a conversation exchange.

    Args:
        user_message: The customer's message
        assistant_response: The agent's response
        existing_profile: Current profile data (to avoid re-extracting)

    Returns:
        ExtractedProfile with any newly discovered information, or None if nothing new
    """
    existing_info = ""
    if existing_profile:
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
            existing_info = "ALREADY KNOWN:\n" + "\n".join(existing_parts) + "\n\n"

    prompt = f"""Extract customer profile information from this conversation exchange.

{existing_info}CUSTOMER MESSAGE:
{user_message}

AGENT RESPONSE:
{assistant_response}

Extract ONLY NEW information not already known. Look for:
- name: Customer's name (first name, full name, or nickname they use)
- phone: Phone number
- email: Email address
- address: Delivery address or location
- language: Language preference (detect from message language - Hebrew, English, Russian, etc.)
- notes: Important details like allergies, dietary restrictions, special preferences

Respond with valid JSON only. Use null for fields with no new information.
Example: {{"name": "David", "phone": null, "email": null, "address": "123 Main St", "language": "Hebrew", "notes": "allergic to nuts"}}

If no new information found, respond with: {{"name": null, "phone": null, "email": null, "address": null, "language": null, "notes": null}}

JSON:"""

    try:
        response = await anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=200,
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


def merge_profile_notes(existing_notes: Optional[str], new_notes: Optional[str]) -> Optional[str]:
    """
    Merge existing notes with new notes, avoiding duplicates.
    """
    if not new_notes:
        return existing_notes
    if not existing_notes:
        return new_notes

    # Simple deduplication - check if new info is already in existing
    if new_notes.lower() in existing_notes.lower():
        return existing_notes

    return f"{existing_notes}; {new_notes}"
