"""clawd_bastion: Provision Bastio.ai and Trylon prompt-injection defense in existing OpenClaw setup."""

import json
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastmcp import Context

from openclaw_molt_mcp.mcp_instance import mcp

from openclaw_molt_mcp.config import Settings

logger = logging.getLogger(__name__)

OPENCLAW_CONFIG_PATHS = [
    Path.home() / ".openclaw" / "openclaw.json",
    Path.home() / ".openclaw" / "clawdbot.json",
]

BASTION_CONFIG = {
    "enabled": True,
    "provider": "bastio",
    "api_url": "https://api.bastio.com/v1",
    "api_key": "${BASTIO_API_KEY}",
    "cache_responses": True,
    "log_inspections": True,
}


def _find_config(workspace_path: Path | None) -> Path | None:
    """Find first existing OpenClaw config file."""
    paths = list(OPENCLAW_CONFIG_PATHS)
    if workspace_path:
        base = Path(workspace_path)
        paths = [
            base / "openclaw.json",
            base / "clawdbot.json",
            base.parent / "openclaw.json",
            base.parent / "clawdbot.json",
        ] + paths
    for p in paths:
        if p.exists():
            return p
    return None


def _backup_config(path: Path) -> Path | None:
    """Create timestamped backup. Returns backup path or None."""
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = path.with_suffix(f".{stamp}.bak{path.suffix}")
    try:
        shutil.copy2(path, backup)
        return backup
    except OSError as e:
        logger.warning("Config backup failed: %s", e)
        return None


@mcp.tool()
async def clawd_bastion(
    ctx: Context,
    operation: Literal["provision_bastio", "provision_trylon", "provision_llamafirewall", "validate", "status"],
    api_key: str | None = None,
    workspace_path: str | None = None,
) -> dict:
    """
    Provision prompt-injection defense in existing OpenClaw setup (Bastio, Trylon, LlamaFirewall).

    **Operations:**
    - `provision_bastio`: Merge gateway.bastion config into OpenClaw config. Backs up existing.
    - `provision_trylon`: Return playbook for Trylon Gateway (self-hosted Docker proxy).
    - `provision_llamafirewall`: Return playbook for Meta PurpleLlama/LlamaFirewall (ML-based, recommended).
    - `validate`: Check if bastion config is present in OpenClaw config.
    - `status`: Check Bastio API reachability (requires api_key).

    **Dialogic returns**: Natural language message plus structured data (backup path, config path, playbook, etc.).
    """
    settings = Settings()
    base = Path(workspace_path) if workspace_path else Path.home() / ".openclaw" / "workspace"
    config_path = _find_config(base)

    if operation == "provision_bastio":
        return _provision_bastio(config_path, api_key, settings)

    if operation == "provision_trylon":
        return _provision_trylon_playbook(config_path)

    if operation == "provision_llamafirewall":
        return _provision_llamafirewall_playbook(config_path)

    if operation == "validate":
        return _validate_bastion(config_path)

    if operation == "status":
        return await _status_bastio(api_key or (getattr(settings, "bastio_api_key", None) or ""))

    return {"success": False, "message": f"Unknown operation: {operation}"}


def _provision_bastion(
    config_path: Path | None,
    api_key: str | None,
    settings: Settings,
) -> dict:
    """Merge Bastio config into OpenClaw config. Backup, merge, write."""
    if not config_path:
        return {
            "success": False,
            "message": "No OpenClaw config found. Run openclaw onboard first.",
            "data": {"paths_checked": [str(p) for p in OPENCLAW_CONFIG_PATHS]},
        }

    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        return {"success": False, "message": f"Could not read config: {e}"}

    gateway = data.get("gateway") or {}
    if gateway.get("bastion", {}).get("provider") == "bastio":
        return {
            "success": True,
            "message": "Bastio already configured in gateway.bastion.",
            "data": {"config_path": str(config_path)},
        }

    backup_path = _backup_config(config_path)
    bastion_cfg = dict(BASTION_CONFIG)
    bastion_cfg["api_key"] = "${BASTIO_API_KEY}"

    gateway["bastion"] = bastion_cfg
    if not gateway.get("bind") or gateway.get("bind") in ("0.0.0.0", "*"):
        gateway["bind"] = "127.0.0.1"
    data["gateway"] = gateway

    try:
        config_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except OSError as e:
        return {"success": False, "message": f"Could not write config: {e}"}

    return {
        "success": True,
        "message": "Bastio config merged. Restart OpenClaw Gateway for changes to take effect.",
        "data": {
            "config_path": str(config_path),
            "backup_path": str(backup_path) if backup_path else None,
            "env_snippet": "BASTIO_API_KEY=your-key-here",
        },
    }


def _provision_trylon_playbook(config_path: Path | None) -> dict:
    """Return Trylon provisioning playbook. No file writes."""
    playbook = {
        "title": "Trylon Gateway provisioning for OpenClaw",
        "steps": [
            {
                "step": 1,
                "action": "Clone and run Trylon Gateway",
                "detail": "git clone https://github.com/trylonai/gateway.git && cd gateway && cp .env.example .env && docker compose up -d",
            },
            {
                "step": 2,
                "action": "Add Trylon provider to OpenClaw config",
                "detail": "In openclaw.json models.providers, add provider with baseUrl: http://localhost:8000/v1 (OpenAI) or http://localhost:8000/anthropic (Anthropic)",
            },
            {
                "step": 3,
                "action": "Set agents.defaults.model to use Trylon provider",
                "detail": "e.g. trylon-openai/gpt-4 or trylon-anthropic/claude-3-5-sonnet",
            },
            {
                "step": 4,
                "action": "Configure policies.yaml in Trylon repo",
                "detail": "Enable PII, prompt injection, toxicity guardrails. See github.com/trylonai/gateway/docs/POLICIES.md",
            },
            {
                "step": 5,
                "action": "Restart OpenClaw Gateway",
                "detail": "Restart so OpenClaw uses Trylon proxy for LLM calls.",
            },
        ],
        "config_path": str(config_path) if config_path else "~/.openclaw/openclaw.json",
        "references": [
            "https://github.com/trylonai/gateway",
            "https://docs.clawd.bot/concepts/model-providers",
            "docs/integrations/TRYLON_INTEGRATION.md",
        ],
    }
    return {
        "success": True,
        "message": "Trylon playbook. Run Trylon Docker, add provider to OpenClaw config, restart Gateway.",
        "data": playbook,
    }


def _provision_llamafirewall_playbook(config_path: Path | None) -> dict:
    """Return LlamaFirewall (PurpleLlama) provisioning playbook. ML-based, recommended over pattern-only tools."""
    playbook = {
        "title": "LlamaFirewall (PurpleLlama) provisioning for OpenClaw",
        "why": "ML-based detection (PromptGuard, AlignmentCheck) more robust than pattern-only tools. ~4k stars, Meta-backed.",
        "steps": [
            {
                "step": 1,
                "action": "Install LlamaFirewall",
                "detail": "pip install llamafirewall",
            },
            {
                "step": 2,
                "action": "Enable webapp pre-scan (optional)",
                "detail": "Set ENABLE_LLAMAFIREWALL=1. Webapp API scans /api/ask messages before forwarding to Gateway.",
            },
            {
                "step": 3,
                "action": "Or run as standalone scan service",
                "detail": "Create FastAPI service that calls LlamaFirewall.scan() on POST /scan. Proxy requests through it.",
            },
            {
                "step": 4,
                "action": "Scanners available",
                "detail": "PromptGuard (jailbreak), AlignmentCheck (goal hijacking), CodeShield (insecure code), custom regex.",
            },
        ],
        "config_path": str(config_path) if config_path else "~/.openclaw/openclaw.json",
        "references": [
            "https://github.com/meta-llama/PurpleLlama/tree/main/LlamaFirewall",
            "https://pypi.org/project/llamafirewall/",
            "https://meta-llama.github.io/PurpleLlama/LlamaFirewall/",
            "docs/integrations/LLAMAFIREWALL_INTEGRATION.md",
        ],
    }
    return {
        "success": True,
        "message": "LlamaFirewall playbook. pip install llamafirewall; enable webapp pre-scan or run standalone service.",
        "data": playbook,
    }


def _validate_bastion(config_path: Path | None) -> dict:
    """Check if bastion config is present."""
    if not config_path:
        return {
            "success": True,
            "message": "No OpenClaw config found.",
            "data": {"bastion_configured": False, "config_path": None},
        }

    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {
            "success": False,
            "message": "Could not read config.",
            "data": {"config_path": str(config_path)},
        }

    gateway = data.get("gateway") or {}
    bastion = gateway.get("bastion") or {}
    provider = bastion.get("provider", "")

    return {
        "success": True,
        "message": f"Bastion configured: {provider}" if provider else "No bastion config.",
        "data": {
            "config_path": str(config_path),
            "bastion_configured": bool(provider),
            "provider": provider or None,
        },
    }


async def _status_bastio(api_key: str) -> dict:
    """Check Bastio API reachability."""
    if not api_key or api_key.startswith("${"):
        return {
            "success": False,
            "message": "api_key required for status check.",
        }

    try:
        import httpx

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.bastio.com/v1/status",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            ok = resp.status_code < 500
            return {
                "success": ok,
                "message": "Bastio API reachable" if ok else f"Bastio returned {resp.status_code}",
                "data": {"status_code": resp.status_code},
            }
    except Exception as e:
        logger.warning("Bastio status check failed: %s", e)
        return {
            "success": False,
            "message": f"Bastio API unreachable: {e}",
        }
