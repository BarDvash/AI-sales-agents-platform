import os
import requests
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from anthropic import AsyncAnthropic

# Load .env file
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Initialize Anthropic client
anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

app = FastAPI()

@app.post("/webhook")
async def telegram_webhook(request: Request):
    payload = await request.json()

    message = payload.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text")

    if chat_id and text:
        # Call LLM instead of echo
        reply = await call_llm(text)
        send_message(chat_id, reply)

    return {"ok": True}

async def call_llm(user_message: str) -> str:
    """
    Call Anthropic LLM with user message.
    Zero system prompt (raw LLM behavior).
    """
    try:
        print(f"Calling LLM with message: {user_message}")
        response = await anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        print(f"LLM Response: {response.content[0].text}")
        return response.content[0].text
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


