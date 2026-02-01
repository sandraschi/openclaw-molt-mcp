# OpenClaw Security Hardening

OpenClaw (formerly Moltbot/Clawdbot) has major security risks when run with default configuration. This document summarizes known vulnerabilities and hardening steps.

## Active Threats (Intruder, Jan 2026)

- **Exposed credentials**: Misconfigurations expose API keys, tokens, entire config files
- **Prompt injection**: Social media integrations leak private data via crafted prompts
- **Malicious skills**: Backdoored plugins via community channels (credential harvesting, botnet recruitment)
- **Configuration corruption**: Non-atomic writes allow agents to overwrite clawdbot.json, remove gateway.mode

## Architectural Vulnerabilities

- **No sandbox by default**: Agent has full access to file system, shell, SSH keys, email
- **Missing validation**: Boot-critical settings not validated before disk write
- **Insufficient guardrails**: Unauthorized posting, data exfiltration, command execution beyond intent

## Hardening Checklist (Auth0, Intruder)

1. **Enable sandbox mode** – Run OpenClaw in VM, container, or devbox. Restrict to one project directory.
2. **Bind gateway to loopback** – Set `gateway.bind` to `127.0.0.1` (not `0.0.0.0`).
3. **Restrict allowFrom** – Whitelist which users/channels can talk to the bot.
4. **Enable allow-lists** – Command allow-list, filesystem allow-list, integration allow-list. Default-deny.
5. **Scoped tokens and secrets** – Use scoped tokens, short-lived credentials. Never store secrets in .env the agent can read.
6. **Audit third-party skills** – Verify source. Malicious skills harvest creds.
7. **Prompt injection defense** – Use model with injection defense. Do not expose to untrusted social channels.
8. **Do not add personal bot to group chats** – Use separate work bot for shared spaces.

## clawd-mcp Security Tools

Use `clawd_security` for:

- **audit**: Gateway bind, auth mode, token presence, openclaw doctor
- **check_skills**: Scan workspace skills for suspicious patterns
- **validate_config**: Validate gateway.bind, allowFrom, tools.allow
- **recommendations**: Return full hardening checklist
- **provision_sandbox**: Orchestration playbook for VM-based sandbox (virtualization-mcp)

## References

- [Auth0: Securing OpenClaw – Five-Step Checklist](https://auth0.com/blog/five-step-guide-securing-moltbot-ai-agent/)
- [Intruder: Clawdbot Security Nightmare](https://www.intruder.io/blog/clawdbot-when-easy-ai-becomes-a-security-nightmare)
- [docs.clawd.bot – Security](https://docs.clawd.bot/security)
