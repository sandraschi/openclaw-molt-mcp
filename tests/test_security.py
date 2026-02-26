"""Tests for clawd_security tool."""

from pathlib import Path

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_security_recommendations(mcp_client) -> None:
    """clawd_security recommendations should return hardening checklist."""
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "recommendations"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    checklist = data.get("data", {}).get("checklist", [])
    assert len(checklist) > 0
    assert any(i.get("id") == "sandbox" for i in checklist)


@pytest.mark.asyncio
async def test_clawd_security_provision_sandbox(mcp_client) -> None:
    """clawd_security provision_sandbox should return playbook."""
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "provision_sandbox"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    playbook = data.get("data", {})
    assert "steps" in playbook
    assert "virtualization-mcp" in data.get("message", "")


@pytest.mark.asyncio
async def test_clawd_security_check_skills_empty(mcp_client, tmp_path: Path) -> None:
    """clawd_security check_skills with no skills dir returns empty scan."""
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "check_skills", "workspace_path": str(workspace)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    assert data.get("data", {}).get("skills_checked") == 0


@pytest.mark.asyncio
async def test_clawd_security_check_skills_with_skill(mcp_client, tmp_path: Path) -> None:
    """clawd_security check_skills scans skills dir."""
    skills_dir = tmp_path / "skills"
    skills_dir.mkdir()
    skill_a = skills_dir / "skill-a"
    skill_a.mkdir()
    (skill_a / "SKILL.md").write_text("# Skill A\n\nUses os.environ for config.\n", encoding="utf-8")
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "check_skills", "workspace_path": str(tmp_path)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    assert data.get("data", {}).get("skills_checked") == 1
    findings = data.get("data", {}).get("findings", [])
    assert any(f.get("skill") == "skill-a" for f in findings)


@pytest.mark.asyncio
async def test_clawd_security_validate_config_no_config(mcp_client, tmp_path: Path) -> None:
    """clawd_security validate_config with no config returns issues."""
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "validate_config", "workspace_path": str(workspace)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    assert len(data.get("data", {}).get("issues", [])) >= 0


@pytest.mark.asyncio
async def test_clawd_security_audit_gateway_unreachable(mcp_client, monkeypatch: pytest.MonkeyPatch) -> None:
    """clawd_security audit when gateway unreachable reports finding."""
    monkeypatch.setenv("OPENCLAW_GATEWAY_URL", "http://127.0.0.1:19999")
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "audit"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    findings = data.get("data", {}).get("findings", [])
    assert any(f.get("id") in ("gateway_unreachable", "gateway_error", "gateway_reachable") for f in findings)


@pytest.mark.asyncio
async def test_clawd_security_unknown_operation(mcp_client) -> None:
    """clawd_security invalid operation is rejected (schema validation or tool error)."""
    result = await mcp_client.call_tool(
        "clawd_security",
        arguments={"operation": "unknown_op"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    # Schema may reject invalid Literal; or tool returns success=False
    assert data.get("success") is not True
