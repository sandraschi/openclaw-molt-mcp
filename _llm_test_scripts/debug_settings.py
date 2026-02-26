import os
import binascii
from openclaw_molt_mcp.config import Settings

# Clear env vars that might be inherited
for k in list(os.environ.keys()):
    if k.startswith("OPENCLAW_"):
        del os.environ[k]

# Explicitly set them to what we want
os.environ["OPENCLAW_GATEWAY_URL"] = "http://localhost:18789"
os.environ["OPENCLAW_GATEWAY_TOKEN"] = (
    "9476c3f8f4a078c47e49b2f38f0472ed6e92c432c4a338c7443a49bf98f0a9ccd"
)

settings = Settings()
token = settings.gateway_token
print(f"URL: {settings.gateway_url}")
print(f"Token: {token}")
print(f"Token Length: {len(token) if token else 0}")
if token:
    print(f"Token Hex: {binascii.hexlify(token.encode()).decode()}")
