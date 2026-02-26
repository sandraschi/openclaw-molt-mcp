import { Activity, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { fetchHealthAggregate, type HealthAggregateResponse } from "../services/api";

const FIX_LINKS: Record<string, string> = {
  openclaw_cli: "https://docs.openclaw.ai",
  gateway: "https://docs.openclaw.ai",
  moltbook: "https://www.moltbook.com",
  ollama: "https://ollama.ai",
  log_server: "https://github.com/sandraschi/openclaw-molt-mcp/blob/main/INSTALL.md",
};

const LABELS: Record<string, string> = {
  api: "Webapp API",
  openclaw_cli: "OpenClaw CLI",
  gateway: "Gateway",
  moltbook: "Moltbook API",
  ollama: "Ollama",
  log_server: "Log server",
};

export default function Health() {
  const [data, setData] = useState<HealthAggregateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHealthAggregate();
      setData(res);
      setLastCheck(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Health check failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Health
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Unified status: Gateway, OpenClaw CLI, Moltbook, Ollama, API, log server.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-xl font-semibold text-foreground">
            Status
          </h2>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded border border-border px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {lastCheck && (
          <p className="mb-4 text-xs text-muted">
            Last check: {lastCheck.toLocaleString()}
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {data?.checks && (
          <div className="space-y-3">
            {Object.entries(data.checks).map(([key, check]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3",
                  check.ok
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      check.ok ? "bg-green-500" : "bg-destructive"
                    )}
                  />
                  <div>
                    <p className="font-medium">{LABELS[key] ?? key}</p>
                    <p className="text-sm text-foreground-secondary">{check.message}</p>
                  </div>
                </div>
                {FIX_LINKS[key] && !check.ok && (
                  <a
                    href={FIX_LINKS[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline hover:no-underline"
                  >
                    Fix
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {!data && !loading && !error && (
          <div
            className={cn(
              "flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8",
              "text-center text-foreground-secondary"
            )}
          >
            <Activity className="mb-2 h-10 w-10 text-muted" />
            <p className="text-sm">Click Refresh to check status.</p>
          </div>
        )}
      </section>
    </div>
  );
}
