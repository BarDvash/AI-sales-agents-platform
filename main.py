import os
import requests
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from anthropic import AsyncAnthropic
from prompts import generate_sales_agent_prompt
from config import valdman

# Load .env file
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Initialize Anthropic client
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

# Load client configuration (currently hardcoded to Valdman)
# Will be dynamic per-customer in Milestone 7
CLIENT_CONFIG = valdman
SALES_AGENT_PROMPT = generate_sales_agent_prompt(CLIENT_CONFIG)

# In-memory conversation history storage (per chat_id)
# Will be replaced with database in Step 3.2
conversation_history = {}

app = FastAPI()

@app.post("/webhook")
async def telegram_webhook(request: Request):
    payload = await request.json()

    message = payload.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text")

    if chat_id and text:
        # Call LLM with conversation history
        reply = await call_llm(text, chat_id)
        send_message(chat_id, reply)

    return {"ok": True}

async def call_llm(user_message: str, chat_id: int) -> str:
    """
    Call Anthropic LLM with user message and conversation history.
    Uses configured sales agent system prompt for personality.
    Maintains last 5 messages for conversation continuity.
    """
    try:
        # Get or initialize conversation history for this chat
        if chat_id not in conversation_history:
            conversation_history[chat_id] = []

        history = conversation_history[chat_id]

        # Add new user message to history
        history.append({"role": "user", "content": user_message})

        # Keep only last 5 messages to manage context size and cost
        history = history[-5:]

        print(f"Calling LLM with message: {user_message}")
        print(f"History length: {len(history)} messages")

        response = await anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=SALES_AGENT_PROMPT,
            messages=history
        )

        assistant_message = response.content[0].text
        print(f"LLM Response: {assistant_message}")

        # Add assistant response to history
        history.append({"role": "assistant", "content": assistant_message})

        # Save updated history (keep last 5 messages)
        conversation_history[chat_id] = history[-5:]

        return assistant_message
    except Exception as e:
        # Basic error handling - print full error details
        import traceback
        print(f"LLM Error: {e}")
        print(traceback.format_exc())
        return "Sorry, I encountered an error. Please try again."

def send_message(chat_id: int, text: str):
    requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={"chat_id": chat_id, "text": text}
    )


