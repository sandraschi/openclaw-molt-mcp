import os
import binascii
from openclaw_molt_mcp.config import Settings

# Clear env vars that might be inherited
for k in list(os.environ.keys()):
    if k.startswith("OPENCLAW_"):
        del os.environ[k]

# Load values from the repo .env so no secret is hardcoded in source.
# Run from the repo root (or set OPENCLAW_GATEWAY_URL / OPENCLAW_GATEWAY_TOKEN yourself).
if os.path.exists(".env"):
    with open(".env", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

settings = Settings()
token = settings.gateway_token
print(f"URL: {settings.gateway_url}")
print(f"Token: {token}")
print(f"Token Length: {len(token) if token else 0}")
if token:
    print(f"Token Hex: {binascii.hexlify(token.encode()).decode()}")
