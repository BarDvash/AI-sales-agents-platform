"""
Agent orchestrator - main agent loop that coordinates message processing.
"""
import os
import asyncio
from anthropic import AsyncAnthropic
from sqlalchemy.orm import Session
from agent.prompt_builder import build_system_prompt
from agent.summarizer import (
    generate_conversation_summary,
    should_summarize,
    get_messages_to_summarize,
    MEMORY_SIZE
)
from agent.profile_extractor import extract_profile_from_message, merge_profile_notes
from agent.profile_context import build_customer_context, get_customer_profile_dict
from tenants.loader import load_tenant_config
from storage.database import get_db
from storage.repositories import ConversationRepository, OrderRepository, CustomerRepository
from tools import TOOL_DEFINITIONS, execute_tool

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


async def process_message(user_message: str, chat_id: str, tenant_id: str = "valdman") -> str:
    """
    Main agent loop: receive → load context → LLM call → tool execution → respond.

    Args:
        user_message: User's text message
        chat_id: Telegram/WhatsApp chat ID
        tenant_id: Tenant identifier (e.g., "valdman")

    Returns:
        Agent's response message
    """
    # Get database session
    db_gen = get_db()
    db = next(db_gen)

    try:
        # Load tenant configuration
        tenant_config = load_tenant_config(tenant_id, db)

        # Get or create conversation and customer
        customer_repo = CustomerRepository(db)
        customer = customer_repo.get_or_create_by_chat_id(tenant_id, str(chat_id))

        conv_repo = ConversationRepository(db)
        conversation = conv_repo.get_or_create_active_conversation(tenant_id, customer.id)

        # Add user message to database
        conv_repo.add_message(conversation.id, "user", user_message)

        # Get conversation state for summarization
        existing_summary, last_summary_at, total_msgs = conv_repo.get_conversation_state(conversation.id)

        # Get conversation history for LLM context
        history = conv_repo.get_conversation_history(customer.id)

        # Keep only recent messages for context (older ones are in summary)
        history = history[-MEMORY_SIZE:]

        # Build customer context (profile + order history)
        order_repo = OrderRepository(db)
        customer_orders = order_repo.get_by_customer(customer.id)
        customer_context = build_customer_context(customer, customer_orders)

        # Build system prompt with customer context and summary for extended memory
        system_prompt = build_system_prompt(tenant_config, existing_summary, customer_context)

        print(f"Calling LLM with message: {user_message}")
        print(f"History length: {len(history)} messages, has_summary: {existing_summary is not None}")

        # Call LLM with system prompt, history, and available tools
        response = await anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=system_prompt,
            messages=history,
            tools=TOOL_DEFINITIONS
        )

        # Handle tool use if LLM decides to call a tool
        if response.stop_reason == "tool_use":
            tool_use = next(block for block in response.content if block.type == "tool_use")
            tool_name = tool_use.name

            print(f"Tool called: {tool_name}")

            # Execute the tool
            tool_input = tool_use.input if hasattr(tool_use, 'input') else {}
            tool_result = execute_tool(
                tool_name,
                tool_input,
                tenant_id,
                str(chat_id),
                db,
                tenant_config
            )

            if isinstance(tool_result, list):
                print(f"Tool result: {len(tool_result)} orders found")
            else:
                print(f"Tool result: {tool_result}")

            # Add tool use to history (in memory for this request)
            history.append({"role": "assistant", "content": response.content})

            # Add tool result to history
            history.append({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": str(tool_result)
                }]
            })

            # Call LLM again with tool result
            response = await anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                system=system_prompt,
                messages=history,
                tools=TOOL_DEFINITIONS
            )

        # Extract final response
        assistant_message = response.content[0].text
        print(f"LLM Response: {assistant_message}")

        # Save assistant message to database
        conv_repo.add_message(conversation.id, "assistant", assistant_message)

        # Fire-and-forget background tasks (non-blocking)
        # Profile extraction
        asyncio.create_task(_extract_and_save_profile(
            user_message,
            assistant_message,
            tenant_id,
            str(chat_id)
        ))

        # Summarization (if needed)
        if should_summarize(total_msgs, last_summary_at):
            asyncio.create_task(_summarize_conversation(
                conversation.id,
                customer.id,
                existing_summary,
                total_msgs
            ))

        return assistant_message

    except Exception as e:
        import traceback
        print(f"Agent Error: {e}")
        print(traceback.format_exc())
        return "Sorry, I encountered an error. Please try again."
    finally:
        # Close database session
        try:
            next(db_gen)
        except StopIteration:
            pass


async def _extract_and_save_profile(
    user_message: str,
    assistant_message: str,
    tenant_id: str,
    chat_id: str
) -> None:
    """
    Extract profile information from conversation and save to database.
    Runs as a background task after the response is sent.
    """
    db_gen = get_db()
    db = next(db_gen)
    try:
        customer_repo = CustomerRepository(db)
        customer = customer_repo.get_by_chat_id(tenant_id, chat_id)
        if not customer:
            return

        existing_profile = get_customer_profile_dict(customer)
        extracted = await extract_profile_from_message(
            user_message,
            assistant_message,
            existing_profile
        )

        if extracted:
            print(f"Profile extracted: {extracted.to_dict()}")

            merged_notes = merge_profile_notes(customer.notes, extracted.notes)

            customer_repo.update_profile(
                customer,
                name=extracted.name or customer.name,
                phone=extracted.phone or customer.phone,
                email=extracted.email or customer.email,
                address=extracted.address or customer.address,
                language=extracted.language or customer.language,
                notes=merged_notes if merged_notes != customer.notes else None,
            )
            print(f"Customer profile updated for {chat_id}")

    except Exception as e:
        print(f"Profile extraction warning: {e}")
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


async def _summarize_conversation(
    conversation_id: int,
    customer_id: int,
    existing_summary: str,
    total_msgs: int
) -> None:
    """
    Generate conversation summary in the background.
    Runs as a background task, doesn't block the response.
    """
    db_gen = get_db()
    db = next(db_gen)
    try:
        print(f"[Background] Generating conversation summary (total msgs: {total_msgs})")
        conv_repo = ConversationRepository(db)

        history = conv_repo.get_conversation_history(customer_id)
        history = history[-MEMORY_SIZE:]
        messages_to_summarize = get_messages_to_summarize(history)

        if messages_to_summarize:
            new_summary = await generate_conversation_summary(
                messages_to_summarize,
                existing_summary
            )
            conv_repo.update_summary(conversation_id, new_summary, total_msgs)
            print(f"[Background] Summary updated at message {total_msgs}: {new_summary[:100]}...")

    except Exception as e:
        print(f"Summarization warning: {e}")
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass
