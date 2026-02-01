"""Ollama API client for webapp API. Assumes Ollama is running (most OpenClaw users have it)."""

import logging
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

OLLAMA_BASE = "http://localhost:11434"
PREPROMPT_PATH = Path(__file__).resolve().parent / "ollama_preprompt.txt"


def load_preprompt() -> str:
    """Load OpenClaw + Moltbook system preprompt for chatbot."""
    if PREPROMPT_PATH.exists():
        return PREPROMPT_PATH.read_text(encoding="utf-8")
    return "You are an expert assistant for OpenClaw and Moltbook. Answer concisely."


async def ollama_health(base: str = OLLAMA_BASE) -> bool:
    """Check if Ollama is reachable."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{base.rstrip('/')}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def ollama_tags(base: str = OLLAMA_BASE) -> list[dict]:
    """List models. Returns list of { name, size, ... }."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"{base.rstrip('/')}/api/tags")
            r.raise_for_status()
            data = r.json()
            return data.get("models", [])
    except Exception as e:
        logger.warning("Ollama tags failed: %s", e)
        return []


async def ollama_generate(
    base: str,
    model: str,
    prompt: str,
    system: str | None = None,
    stream: bool = False,
) -> dict:
    """POST /api/generate. If stream=False, returns full response with 'response'."""
    url = f"{base.rstrip('/')}/api/generate"
    body: dict = {"model": model, "prompt": prompt, "stream": stream}
    if system:
        body["system"] = system
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, json=body)
        r.raise_for_status()
        return r.json()


async def ollama_chat(
    base: str,
    model: str,
    messages: list[dict],
    system: str | None = None,
    stream: bool = False,
) -> dict:
    """POST /api/chat. messages: [{ role, content }, ...]. Returns { message: { role, content } }."""
    url = f"{base.rstrip('/')}/api/chat"
    body: dict = {"model": model, "messages": messages, "stream": stream}
    if system:
        body["system"] = system
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, json=body)
        r.raise_for_status()
        return r.json()


async def ollama_pull(base: str, name: str) -> dict:
    """POST /api/pull. name: model name e.g. llama3.2."""
    url = f"{base.rstrip('/')}/api/pull"
    async with httpx.AsyncClient(timeout=600.0) as client:
        r = await client.post(url, json={"name": name})
        r.raise_for_status()
        return r.json()


async def ollama_delete(base: str, name: str) -> dict:
    """DELETE /api/delete. name: model name."""
    url = f"{base.rstrip('/')}/api/delete"
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.delete(url, json={"name": name})
        r.raise_for_status()
        return r.json() if r.content else {}
