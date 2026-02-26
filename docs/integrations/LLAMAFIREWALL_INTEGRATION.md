# OpenClaw + LlamaFirewall (PurpleLlama) Integration Guide

## Overview

LlamaFirewall is Meta's PurpleLlama framework for detecting and mitigating AI-centric security risks: prompt injection, jailbreaks, goal hijacking, and insecure code. It uses ML-based scanners (PromptGuard, AlignmentCheck, CodeShield) rather than pattern-only rules, making it more robust than regex-based tools.

Use the **clawd_bastion** MCP tool: `clawd_bastion(operation="provision_llamafirewall")` for a playbook.

## Why LlamaFirewall for OpenClaw

- **ML-based**: PromptGuard, AlignmentCheck, CodeShield use models, not just patterns
- **Open source**: ~4k stars, Meta-backed, extensible
- **Production-ready**: Low latency, high-throughput pipeline support
- **Layered defense**: User, system, assistant roles; custom regex scanners

## Installation

```bash
pip install llamafirewall
```

Optional: set `HF_HOME` for model cache:

```bash
export HF_HOME=~/.cache/huggingface
```

## Basic Usage

```python
from llamafirewall import LlamaFirewall
from llamafirewall.types import Role, ScannerType
from llamafirewall.messages import UserMessage

lf = LlamaFirewall(
    scanners={
        Role.USER: [ScannerType.PROMPT_GUARD],
        Role.SYSTEM: [ScannerType.PROMPT_GUARD],
    }
)

lf_input = UserMessage(content=input_text)
result = lf.scan(lf_input)
# result.flagged, result.details
```

## Scanners

| Scanner | Purpose |
|---------|---------|
| `PROMPT_GUARD` | Jailbreak, prompt injection |
| `ALIGNMENT_CHECK` | Goal hijacking, instruction override |
| `CODE_SHIELD` | Insecure code, dangerous patterns |
| Custom regex | Domain-specific patterns |

## Integration Options for OpenClaw

### Option A: Webapp Pre-Scan

If the openclaw-molt-mcp webapp exposes an API that forwards user messages to the Gateway, add optional LlamaFirewall scanning before forwarding:

1. `pip install llamafirewall`
2. Set `ENABLE_LLAMAFIREWALL=1`
3. On each inbound message, call `lf.scan(UserMessage(content=...))`
4. If `result.flagged`, return 400 with details; else forward to Gateway

### Option B: Standalone Scan Service

Run a FastAPI service that scans messages:

```python
# scan_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llamafirewall import LlamaFirewall
from llamafirewall.types import Role, ScannerType
from llamafirewall.messages import UserMessage

app = FastAPI()
lf = LlamaFirewall(scanners={Role.USER: [ScannerType.PROMPT_GUARD]})

class ScanRequest(BaseModel):
    content: str

@app.post("/scan")
def scan(req: ScanRequest):
    result = lf.scan(UserMessage(content=req.content))
    if result.flagged:
        raise HTTPException(400, detail={"flagged": True, "details": result.details})
    return {"flagged": False}
```

Proxy user messages through this service before sending to OpenClaw Gateway.

### Option C: Gateway-Side (Future)

OpenClaw Gateway could optionally load LlamaFirewall and scan inbound messages before processing. This would require Gateway changes.

## Comparison with Bastio / Trylon

| Tool | Type | Detection | Hosting |
|------|------|-----------|---------|
| **LlamaFirewall** | Python library | ML (PromptGuard, etc.) | In-process or sidecar |
| **Bastio** | SaaS API | 14 patterns | Bastio.ai |
| **Trylon** | Proxy | Pattern-based | Self-hosted Docker |

LlamaFirewall is recommended when you want ML-based detection without SaaS dependency or proxy overhead.

## References

- [PurpleLlama LlamaFirewall](https://meta-llama.github.io/PurpleLlama/LlamaFirewall/)
- [PyPI: llamafirewall](https://pypi.org/project/llamafirewall/)
- [GitHub: meta-llama/PurpleLlama](https://github.com/meta-llama/PurpleLlama/tree/main/LlamaFirewall)
