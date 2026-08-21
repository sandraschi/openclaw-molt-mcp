# Per-repo fleet start config for openclaw-molt-mcp
# Edit ports/backend target here - start.ps1 is fleet-standard.
# Points at the REAL Moltbook/OpenClaw dashboard (webapp + webapp_api),
# not the incomplete web_sota scaffold.
@{
    Name         = 'openclaw-molt-mcp'
    BackendPort  = 10745
    FrontendPort = 10744
    HealthPath   = '/api/health'
    WebRoot      = 'D:\Dev\repos\openclaw-molt-mcp\webapp'
    Backend = @{
        Kind          = 'uvicorn'
        UvicornTarget = 'webapp_api.main:app'
        SyncExtras    = @('webapp-api')
        SyncOnStart   = $true
        LoadDotEnv    = $true
        Env           = @{
            WEB_PORT     = '10745'
            OPENCLAW_CLI = 'C:\Users\sandr\AppData\Roaming\npm\openclaw.cmd'
        }
    }
    Frontend = @{
        Kind           = 'vite-npm'
        PackageManager = 'npm'
        PortEnvVar     = 'VITE_PORT'
        ApiTargetEnv   = 'VITE_API_TARGET'
    }
}
