# clawd-mcp justfile

default:
    just check

check:
    ruff check src tests
    ruff format --check src tests
    mypy src
    pytest tests -v

lint:
    ruff check src tests --fix
    ruff format src tests

test:
    pytest tests -v

test-cov:
    pytest tests -v --cov=clawd_mcp --cov-report=term-missing

typecheck:
    mypy src
