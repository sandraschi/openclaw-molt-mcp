import { useEffect, useState } from "react";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { fetchGatewayStatus, routingApi } from "../services/api";

interface StatRow {
  label: string;
  value: string | number;
  ts?: string;
}

export default function Statistics() {
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);
  const [rulesData, setRulesData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchGatewayStatus(),
      routingApi({ operation: "get_routing_rules" }).catch(() => ({ success: false, data: null })),
    ])
      .then(([gw, routing]) => {
        if (cancelled) return;
        setGatewayOk(gw.success);
        const data = routing.success && routing.data ? (routing.data as Record<string, unknown>) : null;
        setRulesData(data);
        const rows: StatRow[] = [
          { label: "Gateway", value: gw.success ? "Reachable" : "Unreachable", ts: new Date().toISOString() },
          { label: "Routing rules source", value: data?.source ?? (data?.agents ? "Gateway" : "None"), ts: new Date().toISOString() },
        ];
        if (data?.agents && typeof data.agents === "object") {
          const count = Object.keys(data.agents as Record<string, unknown>).length;
          rows.push({ label: "Channel-to-agent mappings", value: count, ts: new Date().toISOString() });
        }
        rows.push({ label: "Agents sent to Moltbook", value: "N/A (metrics not yet collected)", ts: new Date().toISOString() });
        rows.push({ label: "MCP tool calls (session)", value: "N/A (log aggregation pending)", ts: new Date().toISOString() });
        setStats(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Statistics
        </h1>
        <p className="mt-2 text-foreground-secondary">
          What is going on over time: Gateway, routing, MCP tool usage, and Moltbook activity. Metrics and log aggregation are in progress; this page shows current snapshot and placeholders.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Current snapshot
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Live values from Gateway and routing. Time-series and Moltbook counts require backend metrics or log aggregation.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-foreground-secondary">
                    <th className="py-2 pr-4 font-medium">Metric</th>
                    <th className="py-2 pr-4 font-medium">Value</th>
                    <th className="py-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-foreground">{row.label}</td>
                      <td className="py-2 pr-4 text-foreground-secondary">{String(row.value)}</td>
                      <td className="py-2 text-xs text-foreground-secondary">
                        {row.ts ? new Date(row.ts).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-mono text-xl font-semibold text-foreground">
              Over time (planned)
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Charts for Gateway health over time, MCP tool calls per hour, and agents/posts sent to Moltbook will appear here once the webapp API exposes <code className="rounded bg-muted px-1 text-xs">/api/stats</code> or log aggregation is wired.
            </p>
            <div className="mt-4 flex min-h-[200px] items-center justify-center rounded border border-dashed border-border bg-muted/30 text-sm text-foreground-secondary">
              No time-series data yet. Backend: add GET /api/stats with time buckets and Moltbook activity counts.
            </div>
          </section>

          {rulesData?.agents && typeof rulesData.agents === "object" && (
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-mono text-xl font-semibold text-foreground">
                Routing topology
              </h2>
              <p className="mt-1 text-sm text-foreground-secondary">
                Channel to agent mapping (from current snapshot).
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground-secondary">
                      <th className="py-2 pr-4 font-medium">Channel</th>
                      <th className="py-2 font-medium">Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(rulesData.agents as Record<string, string>).map(([ch, ag]) => (
                      <tr key={ch} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-foreground">{ch}</td>
                        <td className="py-2 font-mono text-foreground-secondary">{ag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
