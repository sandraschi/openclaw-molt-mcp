"""
FastAPI backend for openclaw-molt-mcp webapp: proxy to OpenClaw Gateway, Ollama (models, generate, chat), skills, clawnews.

Run from repo root with PYTHONPATH=src:
  uvicorn webapp_api.main:app --reload --port 10765
"""

import asyncio
import os
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

OLLAMA_BASE = os.environ.get("OLLAMA_BASE", "http://localhost:11434")
WEBAPP_API_KEY = os.environ.get("WEBAPP_API_KEY", "")

# Requires PYTHONPATH=src
from openclaw_molt_mcp.config import Settings
from openclaw_molt_mcp.gateway_client import GatewayClient
from openclaw_molt_mcp.logging_config import get_log_file_path
from openclaw_molt_mcp.moltbook_client import MoltbookClient
from openclaw_molt_mcp.serve_logs import tail_log_lines
from openclaw_molt_mcp.tools.routing import _routing_config_fallback
from openclaw_molt_mcp.tools.security import run_full_audit

from webapp_api.ollama_client import (
    load_preprompt,
    ollama_chat,
    ollama_delete,
    ollama_generate,
    ollama_health,
    ollama_pull,
    ollama_tags,
)
from webapp_api.landing_page_service import generate_landing_page, sanitize_slug
from webapp_api.mcp_config_insert import insert_into_config, list_clients

app = FastAPI(title="openclaw-molt-mcp Webapp API", version="0.1.0")

# Serve generated landing pages via HTTP
REPO_ROOT = Path(__file__).resolve().parent.parent
GENERATED_DIR = REPO_ROOT / "generated"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
app.mount(
    "/generated", StaticFiles(directory=str(GENERATED_DIR), html=True), name="generated"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:10764", "http://127.0.0.1:10764"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def api_key_middleware(request, call_next):
    """If WEBAPP_API_KEY is set, require X-API-Key on non-health endpoints. Local-only otherwise."""
    if WEBAPP_API_KEY and not (
        request.url.path == "/api/health" or request.url.path.startswith("/generated")
    ):
        key = request.headers.get("X-API-Key")
        if key != WEBAPP_API_KEY:
            return JSONResponse(
                status_code=401, content={"detail": "Invalid or missing X-API-Key"}
            )
    return await call_next(request)


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


LOG_SERVER_URL = os.environ.get("CLAWD_LOG_SERVER_URL", "http://127.0.0.1:8765")


@app.get("/api/health/aggregate")
async def health_aggregate():
    """Aggregate health: Gateway, OpenClaw CLI, Moltbook, Ollama, API, log server."""
    import httpx

    results: dict[str, dict] = {}
    results["api"] = {"ok": True, "message": "Webapp API running"}

    try:
        proc = await asyncio.create_subprocess_exec(
            os.environ.get("OPENCLAW_CLI", "openclaw"),
            "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        results["openclaw_cli"] = {
            "ok": proc.returncode == 0,
            "message": "CLI found" if proc.returncode == 0 else "CLI not found",
        }
    except FileNotFoundError:
        results["openclaw_cli"] = {"ok": False, "message": "openclaw not in PATH"}

    client = GatewayClient(settings)
    try:
        r = await client.tools_invoke(tool="sessions_list", args={})
        results["gateway"] = {
            "ok": r.get("success", False),
            "message": r.get("message", "Unreachable"),
        }
    except Exception as e:
        results["gateway"] = {"ok": False, "message": str(e)}
    finally:
        await client.close()

    try:
        mc = MoltbookClient(settings)
        try:
            r = await mc.get("/feed", params={"limit": "1"})
            results["moltbook"] = {
                "ok": r.get("success", False),
                "message": r.get("message", "Unreachable"),
            }
        finally:
            await mc.close()
    except Exception as e:
        results["moltbook"] = {"ok": False, "message": str(e)}

    try:
        ok = await ollama_health(OLLAMA_BASE)
        results["ollama"] = {"ok": ok, "message": "Reachable" if ok else "Unreachable"}
    except Exception as e:
        results["ollama"] = {"ok": False, "message": str(e)}

    try:
        async with httpx.AsyncClient(timeout=2.0) as hc:
            resp = await hc.get(f"{LOG_SERVER_URL}/")
            results["log_server"] = {
                "ok": resp.status_code < 500,
                "message": "Running" if resp.status_code < 500 else "Error",
            }
    except Exception as e:
        results["log_server"] = {"ok": False, "message": str(e)}

    return {"success": True, "checks": results}


@app.get("/api/logs")
def api_logs(tail: int = 500):
    """Serve log file tail for Logger modal. Same data as serve_logs; no separate log server needed."""
    tail = max(1, min(10000, tail))
    log_path = get_log_file_path()
    entries = tail_log_lines(log_path, n=tail)
    return {"entries": entries, "source": str(log_path)}


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


@app.get("/api/skills/{name}/content")
def skill_content(name: str):
    """Return SKILL.md content for a given skill. Sanitizes name to prevent path traversal."""
    safe_name = "".join(c for c in name if c.isalnum() or c in "-_")
    if safe_name != name:
        raise HTTPException(status_code=400, detail="Invalid skill name")
    skills_dir = _skills_dir()
    skill_path = skills_dir / safe_name / "SKILL.md"
    if not skill_path.exists():
        raise HTTPException(status_code=404, detail="Skill not found")
    try:
        content = skill_path.read_text(encoding="utf-8", errors="replace")
        return {"success": True, "name": safe_name, "content": content}
    except OSError as e:
        raise HTTPException(status_code=500, detail=str(e))


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


class MoltbookRegisterRequest(BaseModel):
    name: str
    bio: str = ""
    personality: str = ""
    goals: str = ""
    ideas: str = ""


@app.get("/api/moltbook/feed")
async def moltbook_feed(limit: int = 20):
    """Get Moltbook feed. Proxies to clawd_moltbook feed."""
    limit = max(1, min(100, limit))
    client = MoltbookClient(settings)
    try:
        result = await client.get("/feed", params={"limit": str(limit)})
        return result
    finally:
        await client.close()


@app.get("/api/moltbook/search")
async def moltbook_search(q: str = ""):
    """Search Moltbook. Proxies to clawd_moltbook search."""
    if not q.strip():
        return {"success": False, "message": "query required", "data": []}
    client = MoltbookClient(settings)
    try:
        result = await client.get("/search", params={"q": q.strip()})
        return result
    finally:
        await client.close()


class MoltbookPostRequest(BaseModel):
    content: str


class MoltbookCommentRequest(BaseModel):
    post_id: str
    content: str


class MoltbookUpvoteRequest(BaseModel):
    post_id: str


@app.post("/api/moltbook/post")
async def moltbook_post_api(req: MoltbookPostRequest):
    """Create a Moltbook post. Rate limit: 1 per 30 min."""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="content required")
    client = MoltbookClient(settings)
    try:
        result = await client.post("/posts", json={"content": req.content.strip()})
        return result
    finally:
        await client.close()


@app.post("/api/moltbook/comment")
async def moltbook_comment_api(req: MoltbookCommentRequest):
    """Add comment to a post. Rate limit: 1 per 20 sec."""
    if not req.post_id.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="post_id and content required")
    client = MoltbookClient(settings)
    try:
        result = await client.post(
            f"/posts/{req.post_id.strip()}/comments",
            json={"content": req.content.strip()},
        )
        return result
    finally:
        await client.close()


@app.post("/api/moltbook/upvote")
async def moltbook_upvote_api(req: MoltbookUpvoteRequest):
    """Upvote a post."""
    if not req.post_id.strip():
        raise HTTPException(status_code=400, detail="post_id required")
    client = MoltbookClient(settings)
    try:
        result = await client.post(f"/posts/{req.post_id.strip()}/upvote")
        return result
    finally:
        await client.close()


@app.post("/api/moltbook/register")
async def moltbook_register_api(req: MoltbookRegisterRequest):
    """Register an agent with Moltbook (POST /api/v1/agents/register). Requires MOLTBOOK_API_KEY. OpenClaw is not required for the API call but recommended for full flow."""
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="name required")
    client = MoltbookClient(settings)
    try:
        body = {
            "name": req.name.strip(),
            "bio": (req.bio or "").strip(),
            "personality": (req.personality or "").strip(),
            "goals": (req.goals or "").strip(),
            "ideas": (req.ideas or "").strip(),
        }
        result = await client.post("/agents/register", json=body)
        return result
    finally:
        await client.close()


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


@app.get("/api/ollama/config")
def ollama_config():
    """Return Ollama base URL the API uses (for debugging). Set OLLAMA_BASE if Ollama is not on localhost:11434."""
    return {"base": OLLAMA_BASE}


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

CHANNEL_OPERATIONS = (
    "list_channels",
    "get_channel_config",
    "send_message",
    "get_recent_messages",
)
ROUTING_OPERATIONS = (
    "get_routing_rules",
    "update_routing",
    "test_routing",
    "get_session_by_channel",
)


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
        raise HTTPException(
            status_code=400,
            detail=f"Unknown operation. Use one of: {', '.join(CHANNEL_OPERATIONS)}",
        )
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
    hero_subtitle: str = "Revolutionizing the way you do things. Built with OpenClaw and openclaw-molt-mcp."
    features: list[str] = []
    github_url: str = "https://github.com"
    author_name: str = "Developer"
    author_bio: str = (
        "I build things. Powered by OpenClaw, Moltbook, and openclaw-molt-mcp."
    )
    donate_link: str = "#"
    hero_image_keyword: str = "technology"
    include_pictures: bool = True


@app.post("/api/landing-page")
async def landing_page_api(req: LandingPageRequest):
    """Generate a static landing page site (hero, features, bio, download, donate, how it works) and DEPLOY.md."""
    # Default output: <repo_root>/generated (relative to cloned repo root, not CWD)
    repo_root = Path(__file__).resolve().parent.parent
    target_path = os.environ.get(
        "LANDING_PAGE_OUTPUT_DIR",
        str(repo_root / "generated"),
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
            hero_image_keyword=req.hero_image_keyword.strip() or "blue,lobster",
            include_pictures=req.include_pictures,
        )
        # Construct HTTP URL to the generated landing page (served via /generated mount)
        slug = sanitize_slug(req.project_name)
        index_url = f"http://localhost:10765/generated/{slug}/www/index.html"
        return {
            "success": True,
            "path": out_path,
            "index_url": index_url,
            "message": "Landing page ready. Click below to preview.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mcp-config/clients")
def mcp_config_clients():
    """List MCP clients and their config file paths (for UI checkboxes)."""
    return {"success": True, "clients": list_clients()}


class McpConfigInsertRequest(BaseModel):
    clients: list[str]


@app.post("/api/mcp-config/insert")
def mcp_config_insert_api(req: McpConfigInsertRequest):
    """Insert openclaw-molt-mcp snippet into selected client configs. Backs up originals; skips if already present."""
    repo_root = REPO_ROOT
    updated: list[str] = []
    skipped: list[str] = []
    backups: dict[str, str] = {}
    errors: dict[str, str] = {}
    client_ids = [c.strip().lower() for c in req.clients if c.strip()]
    if not client_ids:
        raise HTTPException(status_code=400, detail="Select at least one client")
    for cid in client_ids:
        out = insert_into_config(cid, repo_root)
        if out.get("error"):
            errors[cid] = out["error"]
        elif out.get("skipped"):
            skipped.append(cid)
        elif out.get("updated"):
            updated.append(cid)
            if out.get("backup_path"):
                backups[cid] = out["backup_path"]
    return {
        "success": True,
        "updated": updated,
        "skipped": skipped,
        "backups": backups,
        "errors": errors,
        "message": f"Updated: {updated}. Skipped (already present): {skipped}. Errors: {list(errors.keys()) or 'none'}.",
    }


SESSION_OPERATIONS = ("list", "history", "send")


class SessionsRequest(BaseModel):
    operation: str
    session_key: str = "main"
    args: dict | None = None


@app.post("/api/sessions")
async def sessions_api(req: SessionsRequest):
    """Proxy to clawd_sessions (Gateway tools: sessions_list, sessions_history, sessions_send)."""
    if req.operation not in SESSION_OPERATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown operation. Use one of: {', '.join(SESSION_OPERATIONS)}",
        )
    tool_map = {
        "list": "sessions_list",
        "history": "sessions_history",
        "send": "sessions_send",
    }
    tool_name = tool_map[req.operation]
    client = GatewayClient(settings)
    try:
        result = await client.tools_invoke(
            tool=tool_name,
            action="json",
            args=req.args or {},
            session_key=req.session_key,
        )
        return result
    finally:
        await client.close()


@app.post("/api/security/audit")
async def security_audit():
    """Run full security audit: audit, check_skills, validate_config, recommendations. Proxies to clawd_security logic."""
    try:
        result = await asyncio.to_thread(run_full_audit, settings)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/routing")
async def routing_api(req: RoutingRequest):
    """Proxy to Gateway tool 'routing'. Operations: get_routing_rules, update_routing, test_routing, get_session_by_channel. Fallback: get_routing_rules from config."""
    if req.operation not in ROUTING_OPERATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown operation. Use one of: {', '.join(ROUTING_OPERATIONS)}",
        )
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
