"""Tests for clawd_skills tool."""

from pathlib import Path

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_skills_list_with_skills(
    mcp_client,
    skills_workspace: Path,
) -> None:
    """clawd_skills list should return skills from workspace."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={"operation": "list", "workspace_path": str(skills_workspace)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data["success"] is True
    assert "skill-a" in data.get("data", {}).get("skills", [])
    assert "skill-b" in data.get("data", {}).get("skills", [])


@pytest.mark.asyncio
async def test_clawd_skills_list_empty_dir(mcp_client, empty_skills_workspace: Path) -> None:
    """clawd_skills list with empty skills dir should return empty list."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={"operation": "list", "workspace_path": str(empty_skills_workspace)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    assert data.get("data", {}).get("skills", []) == []


@pytest.mark.asyncio
async def test_clawd_skills_list_no_dir(mcp_client, no_skills_workspace: Path) -> None:
    """clawd_skills list with no skills dir should return onboarding hint."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={"operation": "list", "workspace_path": str(no_skills_workspace)},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data["success"] is True
    assert "onboard" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_skills_read_success(mcp_client, skills_workspace: Path) -> None:
    """clawd_skills read should return SKILL.md content."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={
            "operation": "read",
            "skill_name": "skill-a",
            "workspace_path": str(skills_workspace),
        },
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is True
    assert "Skill A" in data.get("data", {}).get("content", "")


@pytest.mark.asyncio
async def test_clawd_skills_read_not_found(mcp_client, skills_workspace: Path) -> None:
    """clawd_skills read with unknown skill should return error."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={
            "operation": "read",
            "skill_name": "nonexistent",
            "workspace_path": str(skills_workspace),
        },
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is False
    assert "not found" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_skills_read_missing_name(mcp_client) -> None:
    """clawd_skills read without skill_name should return error."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={"operation": "read", "workspace_path": "/tmp"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is False
    assert "required" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_skills_read_path_traversal_rejected(mcp_client, skills_workspace: Path) -> None:
    """clawd_skills read with path traversal in skill_name should be rejected."""
    result = await mcp_client.call_tool(
        "clawd_skills",
        arguments={
            "operation": "read",
            "skill_name": "../../../etc/passwd",
            "workspace_path": str(skills_workspace),
        },
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is False
    assert "invalid" in data.get("message", "").lower()
