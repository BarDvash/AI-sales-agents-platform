"""
Agent orchestrator - main agent loop that coordinates message processing.
"""
import os
from anthropic import AsyncAnthropic
from sqlalchemy.orm import Session
from agent.prompt_builder import build_system_prompt
from tenants.loader import load_tenant_config
from storage.database import get_db
from storage.repositories import ConversationRepository
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

        # Build system prompt from tenant config
        system_prompt = build_system_prompt(tenant_config)

        # Get or create conversation and customer
        from storage.repositories import CustomerRepository
        customer_repo = CustomerRepository(db)
        customer = customer_repo.get_or_create_by_chat_id(tenant_id, str(chat_id))

        conv_repo = ConversationRepository(db)
        conversation = conv_repo.get_or_create_active_conversation(tenant_id, customer.id)

        # Add user message to database
        conv_repo.add_message(conversation.id, "user", user_message)

        # Get conversation history
        history = conv_repo.get_conversation_history(customer.id)

        # Keep only last 10 messages for context
        history = history[-10:]

        print(f"Calling LLM with message: {user_message}")
        print(f"History length: {len(history)} messages")

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
