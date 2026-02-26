# OpenClaw + Trylon Gateway Integration Guide

## Overview

Trylon Gateway is an open-source firewall for LLMs that provides prompt injection defense, PII redaction, and content filtering. It runs as a self-hosted proxy between your application and LLM providers.

Use the **clawd_bastion** MCP tool: `clawd_bastion(operation="provision_trylon")` for a playbook.

## How Trylon Fits with OpenClaw

- **Trylon**: Proxies LLM API calls (OpenAI, Anthropic, Claude). Validates prompts and responses.
- **OpenClaw**: Uses model providers (Anthropic, OpenAI, Ollama, etc.) for the agent's LLM.

**Integration**: Point OpenClaw's model provider `baseUrl` to Trylon's proxy instead of the real API. Trylon sits between OpenClaw and the LLM.

## Quick Start

### 1. Run Trylon Gateway (Docker)

```powershell
git clone https://github.com/trylonai/gateway.git
cd gateway
Copy-Item .env.example .env
docker compose up -d
```

Trylon runs on port 8000 by default.

### 2. Configure OpenClaw to Use Trylon

Add a custom provider in `openclaw.json` that points to Trylon:

**For OpenAI models** (Trylon exposes `/v1`):
```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "trylon-openai": {
        "baseUrl": "http://localhost:8000/v1",
        "apiKey": "${OPENAI_API_KEY}",
        "api": "openai-completions",
        "models": [{"id": "gpt-4", "name": "GPT-4"}]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {"primary": "trylon-openai/gpt-4"}
    }
  }
}
```

**For Anthropic** (Trylon exposes `/anthropic`):
```json
{
  "models": {
    "providers": {
      "trylon-anthropic": {
        "baseUrl": "http://localhost:8000/anthropic",
        "apiKey": "${ANTHROPIC_API_KEY}",
        "api": "anthropic-messages",
        "models": [{"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet"}]
      }
    }
  }
}
```

### 3. Policy Configuration

Edit Trylon's `policies.yaml` to enable guardrails (PII, prompt injection, toxicity). See [Trylon docs](https://github.com/trylonai/gateway/blob/main/docs/POLICIES.md).

## clawd_bastion provision_trylon

Returns a playbook with:
1. Docker commands to run Trylon
2. Config snippets for OpenClaw
3. Restart instructions

## References

- [Trylon Gateway](https://github.com/trylonai/gateway)
- [Trylon AI Platform](https://www.trylon.ai)
- [OpenClaw Model Providers](https://docs.clawd.bot/concepts/model-providers)
