#!/usr/bin/env python3
"""
Agent CLI - E2E testing tool for the sales agent.
Calls the orchestrator directly - no server or Telegram needed.
Requires: PostgreSQL running + .env file in project root (DATABASE_URL, ANTHROPIC_API_KEY).

Usage:
    python scripts/agent_cli.py --chat-id test-001 -m "היי מה יש לכם?"
    python scripts/agent_cli.py --tenant joannas_bakery --chat-id test-001 -m "what do you have?"

Use the same --chat-id across calls to maintain a multi-turn conversation.
"""
import sys
import os
import asyncio
import argparse
import json

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

# Auto-load .env file (so users don't need `set -a && source .env`)
from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from agent.orchestrator import process_message


def format_tool_calls(tool_calls: list) -> str:
    """Format tool calls into a readable display."""
    if not tool_calls:
        return ""

    lines = []
    lines.append("┌─ Tool Calls ─────────────────────────────────────┐")
    for tc in tool_calls:
        name = tc["name"]
        tool_input = tc["input"]
        result = tc["result"]

        lines.append(f"│ {name}")

        # Format input (compact JSON)
        input_str = json.dumps(tool_input, ensure_ascii=False, indent=2)
        for input_line in input_str.split("\n"):
            lines.append(f"│   {input_line}")

        # Format result
        if isinstance(result, dict) and result.get("success"):
            result_str = json.dumps(result, ensure_ascii=False)
            lines.append(f"│ OK: {result_str}")
        elif isinstance(result, dict) and result.get("error"):
            lines.append(f"│ ERROR: {result['error']}")
        elif isinstance(result, list):
            lines.append(f"│ OK: [{len(result)} items]")
            for item in result[:3]:
                item_str = json.dumps(item, ensure_ascii=False)[:100]
                lines.append(f"│   {item_str}")
            if len(result) > 3:
                lines.append(f"│   ... and {len(result) - 3} more")
        else:
            result_str = json.dumps(result, ensure_ascii=False) if not isinstance(result, str) else result
            lines.append(f"│ -> {result_str}")

    lines.append("└───────────────────────────────────────────────────┘")
    return "\n".join(lines)


async def send_message(tenant_id: str, chat_id: str, message: str):
    """Send a single message and print the result."""
    # Capture orchestrator logs separately
    import io
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    try:
        result = await process_message(message, chat_id, tenant_id=tenant_id)
        # Wait for background tasks (profile extraction, summarization) to complete
        pending = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)
        server_logs = sys.stdout.getvalue()
    finally:
        sys.stdout = old_stdout

    # Print server logs (separated)
    if server_logs.strip():
        print("──────────── Server Logs ────────────")
        print(server_logs.strip())
        print("─────────────────────────────────────")

    # Show tool calls if any
    tool_output = format_tool_calls(result.tool_calls)
    if tool_output:
        print()
        print("──────────── Agent Trace ────────────")
        print(tool_output)
        print("─────────────────────────────────────")

    # Show agent response
    print()
    print(f"Agent: {result.response_text}")
    print()


def main():
    parser = argparse.ArgumentParser(description="CLI chat for E2E agent testing")
    parser.add_argument("--tenant", default="valdman", help="Tenant ID (default: valdman)")
    parser.add_argument("--chat-id", required=True, help="Chat ID (use consistent ID for multi-turn)")
    parser.add_argument("-m", "--message", required=True, help="Message to send to the agent")
    args = parser.parse_args()

    asyncio.run(send_message(args.tenant, args.chat_id, args.message))


if __name__ == "__main__":
    main()
