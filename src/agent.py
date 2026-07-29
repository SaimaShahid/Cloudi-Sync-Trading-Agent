import json
import os
import time

from src.main import fireworks_client, SYSTEM_PROMPT
from src.surge_client import (
    SurgeClient,
    SurgeError,
    SurgeForbiddenError,
    SurgeRateLimitError,
)

# Verify this against your Fireworks account before relying on it in production.
# Any tool-calling-capable Fireworks model works here; this is just a starting default.
FIREWORKS_MODEL = os.getenv("FIREWORKS_MODEL", "accounts/fireworks/models/kimi-k2-instruct-0905")

MAX_TOOL_ROUNDTRIPS = 6
RATE_LIMIT_BACKOFF_SECONDS = 10

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_launch_info",
            "description": "Fetch live SURGE config: supported chains, fees, minBalance, categories, file limits. Call this first, before anything else.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_wallet",
            "description": "Create (or get, if one already exists) a server-managed EVM wallet for the user.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_wallet_solana",
            "description": "Create (or get, if one already exists) a server-managed Solana wallet for the user.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_wallet_balance",
            "description": "Check the on-chain native balance of a wallet, and whether it meets the minimum required balance.",
            "parameters": {
                "type": "object",
                "properties": {"wallet_id": {"type": "string", "description": "The walletId returned by create_wallet or create_wallet_solana."}},
                "required": ["wallet_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_wallet_history",
            "description": "Get a paginated list of past trades and launches for a wallet.",
            "parameters": {
                "type": "object",
                "properties": {
                    "wallet_id": {"type": "string", "description": "The walletId returned by create_wallet or create_wallet_solana."},
                    "limit": {"type": "integer", "description": "Number of records to return, default 20, max 100."},
                    "offset": {"type": "integer", "description": "Number of records to skip, default 0."},
                },
                "required": ["wallet_id"],
            },
        },
    },
]


def _dispatch_tool_call(client, name, arguments):
    method = getattr(client, name, None)
    if method is None:
        return {"error": f"Unknown tool: {name}"}

    try:
        return method(**arguments)
    except SurgeForbiddenError as error:
        return {
            "error": "forbidden",
            "message": error.message,
            "is_permanent": error.is_permanent,
            "until": error.until,
        }
    except SurgeRateLimitError as error:
        return {"error": "rate_limited", "message": error.message}
    except SurgeError as error:
        return {"error": "surge_error", "message": error.message, "code": error.code}


def run_agent_turn(client, messages, model=FIREWORKS_MODEL):
    """Runs one user turn to completion, including any tool-call round-trips.

    Returns (reply_text, updated_messages). Mutates and returns the same
    messages list so the caller can persist it across turns.
    """
    rate_limit_retries = 0

    for _ in range(MAX_TOOL_ROUNDTRIPS):
        response = fireworks_client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        choice = response.choices[0].message

        if not choice.tool_calls:
            messages.append({"role": "assistant", "content": choice.content})
            return choice.content, messages

        messages.append(
            {
                "role": "assistant",
                "content": choice.content,
                "tool_calls": [tc.model_dump() for tc in choice.tool_calls],
            }
        )

        stop_after_this_round = False

        for tool_call in choice.tool_calls:
            arguments = json.loads(tool_call.function.arguments or "{}")
            result = _dispatch_tool_call(client, tool_call.function.name, arguments)

            if isinstance(result, dict) and result.get("error") == "forbidden":
                stop_after_this_round = True
            elif isinstance(result, dict) and result.get("error") == "rate_limited":
                rate_limit_retries += 1
                if rate_limit_retries > 1:
                    stop_after_this_round = True
                else:
                    time.sleep(RATE_LIMIT_BACKOFF_SECONDS)

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                }
            )

        if stop_after_this_round:
            messages.append(
                {
                    "role": "user",
                    "content": "A tool call was blocked or rate-limited. Do not retry it. Explain what happened to the user instead.",
                }
            )

    # Ran out of round-trips without a final text answer.
    return (
        "I hit the limit of tool calls I'm allowed to make in one turn. Please try rephrasing your request.",
        messages,
    )


def _run_cli():
    try:
        client = SurgeClient()
    except SurgeError as error:
        print(f"Could not start SURGE client: {error.message}")
        return

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    print("Cloudi Sync SURGE agent (read-only). Type 'exit' to quit.")

    while True:
        user_input = input("> ").strip()
        if user_input.lower() in ("exit", "quit"):
            break
        if not user_input:
            continue

        messages.append({"role": "user", "content": user_input})
        reply, messages = run_agent_turn(client, messages)
        print(reply)


if __name__ == "__main__":
    _run_cli()
