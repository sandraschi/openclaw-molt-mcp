"""
FastAPI backend for clawd-mcp webapp: proxy to OpenClaw Gateway, Ollama (models, generate, chat), skills, clawnews.

Run from repo root with PYTHONPATH=src:
  uvicorn webapp_api.main:app --reload --port 5181
"""

import asyncio
import os
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OLLAMA_BASE = os.environ.get("OLLAMA_BASE", "http://localhost:11434")

# Requires PYTHONPATH=src
from clawd_mcp.config import Settings
from clawd_mcp.gateway_client import GatewayClient
from clawd_mcp.tools.routing import _routing_config_fallback

from webapp_api.ollama_client import (
    load_preprompt,
    ollama_chat,
    ollama_delete,
    ollama_generate,
    ollama_health,
    ollama_pull,
    ollama_tags,
)
from webapp_api.landing_page_service import generate_landing_page

app = FastAPI(title="clawd-mcp Webapp API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5180", "http://127.0.0.1:5180"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = Settings()


class AskRequest(BaseModel):
    message: str


class AskResponse(BaseModel):
    success: bool
    message: str
    data: dict | None = None
    error: str | None = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/openclaw/status")
async def openclaw_status():
    """Detect if OpenClaw CLI is installed (openclaw --version). Returns cli_installed and optional version."""
    cli_name = os.environ.get("OPENCLAW_CLI", "openclaw")
    cli_path = shutil.which(cli_name)
    if not cli_path:
        return {"cli_installed": False}
    try:
        proc = await asyncio.create_subprocess_exec(
            cli_name,
            "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        out = (stdout or b"").decode("utf-8", errors="replace").strip()
        err = (stderr or b"").decode("utf-8", errors="replace").strip()
        version = out or err or None
        if proc.returncode != 0 and not version:
            return {"cli_installed": True, "version": None}
        return {"cli_installed": True, "version": version or None}
    except (FileNotFoundError, OSError):
        return {"cli_installed": False}


@app.post("/api/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    """Send message to OpenClaw via Gateway /hooks/wake. Agent (with its LLM) processes it."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message required")
    client = GatewayClient(settings)
    try:
        result = await client.hooks_wake(text=req.message.strip(), mode="now")
        return AskResponse(
            success=result.get("success", False),
            message=result.get("message", ""),
            data=result.get("data"),
            error=result.get("error"),
        )
    finally:
        await client.close()


@app.get("/api/gateway/status")
async def gateway_status():
    """Gateway reachability and sessions_list result."""
    client = GatewayClient(settings)
    try:
        result = await client.tools_invoke(
            tool="sessions_list",
            action="json",
            args={},
        )
        return result
    finally:
        await client.close()


def _skills_dir() -> Path:
    base = settings.workspace_path or Path.home() / ".openclaw" / "workspace"
    return base / "skills"


@app.get("/api/skills")
def list_skills():
    """List OpenClaw workspace skills (same source as clawd_skills). Not duplication: single source, dashboard view."""
    skills_dir = _skills_dir()
    if not skills_dir.exists():
        return {"success": True, "skills": [], "path": str(skills_dir)}
    skills = []
    for d in skills_dir.iterdir():
        if d.is_dir() and (d / "SKILL.md").exists():
            skills.append(d.name)
    return {"success": True, "skills": sorted(skills), "path": str(skills_dir)}


# Curated recent media (Jan–Feb 2026). Update periodically or add RSS/search later.
CLAW_NEWS = [
    {
        "title": "OpenClaw's AI assistants are now building their own social network",
        "source": "TechCrunch",
        "url": "https://techcrunch.com/2026/01/30/openclaws-ai-assistants-are-now-building-their-own-social-network",
        "date": "2026-01-30",
    },
    {
        "title": "There's a social network for AI agents, and it's getting weird",
        "source": "The Verge",
        "url": "https://theverge.com/ai-artificial-intelligence/871006/social-network-facebook-for-ai-agents-moltbook-moltbot-openclaw",
        "date": "2026-01-30",
    },
    {
        "title": "OpenClaw (Clawdbot) Setup Guide: Your 24/7 AI Assistant",
        "source": "Bitdoze",
        "url": "https://bitdoze.com/clawdbot-setup-guide",
        "date": "2026-01",
    },
    {
        "title": "Model Providers – OpenClaw",
        "source": "docs.clawd.bot",
        "url": "https://docs.clawd.bot/concepts/model-providers",
        "date": "2026",
    },
    {
        "title": "Ollama provider – OpenClaw",
        "source": "docs.clawd.bot",
        "url": "https://docs.clawd.bot/providers/ollama",
        "date": "2026",
    },
]


@app.get("/api/clawnews")
def clawnews():
    """Today's media echo: curated recent OpenClaw/Moltbook news and docs."""
    return {"success": True, "items": CLAW_NEWS}


# --- Ollama proxy (local LLM; assumes Ollama running) ---


class GenerateRequest(BaseModel):
    model: str
    prompt: str
    system: str | None = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    system: str | None = None


class PullRequest(BaseModel):
    name: str


class DeleteRequest(BaseModel):
    name: str


@app.get("/api/ollama/health")
async def ollama_health_route():
    """Check if Ollama is reachable."""
    ok = await ollama_health(OLLAMA_BASE)
    return {"ok": ok}


@app.get("/api/ollama/tags")
async def ollama_tags_route():
    """List Ollama models."""
    models = await ollama_tags(OLLAMA_BASE)
    return {"success": True, "models": models}


@app.post("/api/ollama/generate")
async def ollama_generate_route(req: GenerateRequest):
    """One-off generate (no chat history)."""
    try:
        out = await ollama_generate(
            OLLAMA_BASE,
            model=req.model,
            prompt=req.prompt.strip(),
            system=req.system,
            stream=False,
        )
        return {"success": True, "response": out.get("response", ""), "raw": out}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/api/ollama/chat")
async def ollama_chat_route(req: ChatRequest):
    """Chat with history; system prompt from preprompt if not provided."""
    system = req.system
    if system is None or not system.strip():
        system = load_preprompt()
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    try:
        out = await ollama_chat(
            OLLAMA_BASE,
            model=req.model,
            messages=messages,
            system=system.strip() or None,
            stream=False,
        )
        msg = out.get("message", {})
        return {
            "success": True,
            "message": msg,
            "response": msg.get("content", ""),
            "raw": out,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/api/ollama/pull")
async def ollama_pull_route(req: PullRequest):
    """Pull model by name (e.g. llama3.2)."""
    try:
        out = await ollama_pull(OLLAMA_BASE, req.name.strip())
        return {"success": True, "raw": out}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.delete("/api/ollama/delete")
async def ollama_delete_route(req: DeleteRequest):
    """Delete model by name."""
    try:
        await ollama_delete(OLLAMA_BASE, req.name.strip())
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# --- Channels and routing (Gateway tools; same as clawd_channels / clawd_routing) ---

CHANNEL_OPERATIONS = ("list_channels", "get_channel_config", "send_message", "get_recent_messages")
ROUTING_OPERATIONS = ("get_routing_rules", "update_routing", "test_routing", "get_session_by_channel")


class ChannelsRequest(BaseModel):
    operation: str
    channel: str | None = None
    to: str | None = None
    message: str | None = None
    limit: int = 20
    session_key: str = "main"
    args: dict | None = None


class RoutingRequest(BaseModel):
    operation: str
    channel: str | None = None
    agent: str | None = None
    peer: str | None = None
    body: str | None = None
    session_key: str = "main"
    args: dict | None = None


@app.post("/api/channels")
async def channels_api(req: ChannelsRequest):
    """Proxy to Gateway tool 'channels'. Operations: list_channels, get_channel_config, send_message, get_recent_messages."""
    if req.operation not in CHANNEL_OPERATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown operation. Use one of: {', '.join(CHANNEL_OPERATIONS)}")
    args = dict(req.args or {})
    if req.channel:
        args["channel"] = req.channel.strip()
    if req.to:
        args["to"] = req.to.strip()
    if req.message:
        args["message"] = req.message.strip()
    if req.operation == "get_recent_messages":
        args["limit"] = max(1, min(req.limit, 100))
    client = GatewayClient(settings)
    try:
        result = await client.tools_invoke(
            tool="channels",
            action=req.operation,
            args=args,
            session_key=req.session_key,
        )
        return result
    finally:
        await client.close()


class LandingPageRequest(BaseModel):
    project_name: str
    hero_title: str = "The Next Big Thing"
    hero_subtitle: str = "Revolutionizing the way you do things. Built with OpenClaw and clawd-mcp."
    features: list[str] = []
    github_url: str = "https://github.com"
    author_name: str = "Developer"
    author_bio: str = "I build things. Powered by OpenClaw, Moltbook, and clawd-mcp."
    donate_link: str = "#"
    hero_image_keyword: str = "technology"


@app.post("/api/landing-page")
async def landing_page_api(req: LandingPageRequest):
    """Generate a static landing page site (hero, features, bio, download, donate, how it works) and DEPLOY.md."""
    target_path = os.environ.get(
        "LANDING_PAGE_OUTPUT_DIR",
        str(Path.cwd() / "generated"),
    )
    try:
        out_path = await asyncio.to_thread(
            generate_landing_page,
            project_name=req.project_name.strip(),
            hero_title=req.hero_title.strip(),
            hero_subtitle=req.hero_subtitle.strip(),
            features=req.features if req.features else None,
            github_url=req.github_url.strip(),
            author_name=req.author_name.strip(),
            author_bio=req.author_bio.strip(),
            donate_link=req.donate_link.strip(),
            target_path=target_path,
            hero_image_keyword=req.hero_image_keyword.strip() or "technology",
        )
        return {
            "success": True,
            "path": out_path,
            "message": f"Landing page generated at {out_path}. Open index.html in a browser. See DEPLOY.md in the project folder for how to get it online.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/routing")
async def routing_api(req: RoutingRequest):
    """Proxy to Gateway tool 'routing'. Operations: get_routing_rules, update_routing, test_routing, get_session_by_channel. Fallback: get_routing_rules from config."""
    if req.operation not in ROUTING_OPERATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown operation. Use one of: {', '.join(ROUTING_OPERATIONS)}")
    args = dict(req.args or {})
    if req.channel:
        args["channel"] = req.channel.strip()
    if req.agent:
        args["agent"] = req.agent.strip()
    if req.peer:
        args["peer"] = req.peer.strip()
    if req.body is not None:
        args["body"] = req.body
    client = GatewayClient(settings)
    try:
        result = await client.tools_invoke(
            tool="routing",
            action=req.operation,
            args=args,
            session_key=req.session_key,
        )
        if req.operation == "get_routing_rules" and not result.get("success"):
            fallback = _routing_config_fallback(settings)
            if fallback:
                return {
                    "success": True,
                    "message": "Routing rules from OpenClaw config (Gateway routing tool not available).",
                    "data": fallback,
                }
        return result
    finally:
        await client.close()
