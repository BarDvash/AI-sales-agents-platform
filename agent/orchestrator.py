"""
Agent orchestrator - main agent loop that coordinates message processing.
"""
import os
from anthropic import AsyncAnthropic
from agent.prompt_builder import build_system_prompt
from tenants.loader import load_tenant_config
from storage.state import conversation_history, orders, order_counter
from tools import TOOL_DEFINITIONS, execute_tool

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


async def process_message(user_message: str, chat_id: int) -> str:
    """
    Main agent loop: receive → load context → LLM call → tool execution → respond.

    Args:
        user_message: User's text message
        chat_id: Unique identifier for the conversation

    Returns:
        Agent's response message
    """
    try:
        # Load tenant configuration (currently hardcoded, will be dynamic)
        tenant_config = load_tenant_config()

        # Build system prompt from tenant config
        system_prompt = build_system_prompt(tenant_config)

        # Get or initialize conversation history
        if chat_id not in conversation_history:
            conversation_history[chat_id] = []

        history = conversation_history[chat_id]

        # Add user message to history
        history.append({"role": "user", "content": user_message})

        # Keep only last 5 messages
        history = history[-5:]

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
                chat_id,
                orders,
                order_counter,
                tenant_config
            )

            if isinstance(tool_result, list):
                print(f"Tool result: {len(tool_result)} orders found")
            else:
                print(f"Tool result: {tool_result}")

            # Add tool use to history
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

        # Add response to history
        history.append({"role": "assistant", "content": assistant_message})

        # Save updated history (keep last 5 messages)
        conversation_history[chat_id] = history[-5:]

        return assistant_message

    except Exception as e:
        import traceback
        print(f"Agent Error: {e}")
        print(traceback.format_exc())
        return "Sorry, I encountered an error. Please try again."
