# Changelog

All notable changes to clawd-mcp will be documented in this file.

## [Unreleased]

### Added

- Extensive testing scaffold: conftest, test_config, test_gateway_client, test_agent, test_gateway_tool, test_sessions, test_skills, test_server
- mypy and ruff config in pyproject.toml
- scripts/check.ps1 and justfile for lint, typecheck, test
- pre-commit hooks for ruff and mypy
- Git repository initialized
- Initial scaffold: FastMCP 2.14+ MCP server
- Portmanteau tools: clawd_agent, clawd_sessions, clawd_skills, clawd_gateway
- Dialogic tool returns (success, message, data)
- MCPB packaging with extensive prompts (system, user, quick-start, configuration, troubleshooting, examples)
- Monorepo with React + Tailwind dark webapp
- Gateway client for Tools Invoke and Webhooks API
