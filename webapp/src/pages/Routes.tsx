import { useEffect, useState } from "react";
import { Route, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../utils/cn";
import {
  routingApi,
  type RoutingResponse,
  type RoutingRequest,
} from "../services/api";

export default function RoutesPage() {
  const [rulesResult, setRulesResult] = useState<RoutingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updateChannel, setUpdateChannel] = useState("");
  const [updateAgent, setUpdateAgent] = useState("");
  const [updateResult, setUpdateResult] = useState<RoutingResponse | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [testChannel, setTestChannel] = useState("");
  const [testPeer, setTestPeer] = useState("");
  const [testBody, setTestBody] = useState("");
  const [testResult, setTestResult] = useState<RoutingResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [sessionChannel, setSessionChannel] = useState("");
  const [sessionPeer, setSessionPeer] = useState("");
  const [sessionResult, setSessionResult] = useState<RoutingResponse | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    routingApi({ operation: "get_routing_rules" })
      .then((r) => {
        if (!cancelled) setRulesResult(r);
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

  async function handleUpdate() {
    if (!updateChannel.trim() || !updateAgent.trim()) return;
    setUpdateLoading(true);
    setUpdateResult(null);
    try {
      const r = await routingApi({
        operation: "update_routing",
        channel: updateChannel.trim(),
        agent: updateAgent.trim(),
      });
      setUpdateResult(r);
      if (r.success) {
        const rules = await routingApi({ operation: "get_routing_rules" });
        setRulesResult(rules);
      }
    } catch (err) {
      setUpdateResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleTest() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const body: RoutingRequest = { operation: "test_routing" };
      if (testChannel.trim()) body.channel = testChannel.trim();
      if (testPeer.trim()) body.peer = testPeer.trim();
      if (testBody.trim()) body.body = testBody.trim();
      const r = await routingApi(body);
      setTestResult(r);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTestLoading(false);
    }
  }

  async function handleGetSession() {
    if (!sessionChannel.trim()) return;
    setSessionLoading(true);
    setSessionResult(null);
    try {
      const body: RoutingRequest = {
        operation: "get_session_by_channel",
        channel: sessionChannel.trim(),
      };
      if (sessionPeer.trim()) body.peer = sessionPeer.trim();
      const r = await routingApi(body);
      setSessionResult(r);
    } catch (err) {
      setSessionResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSessionLoading(false);
    }
  }

  const rulesData = rulesResult?.data as Record<string, unknown> | undefined;
  const agentsMap = rulesData?.agents as Record<string, string> | undefined ?? (rulesData && !Array.isArray(rulesData) ? rulesData as Record<string, string> : {});

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Routes
        </h1>
        <p className="mt-2 text-foreground-secondary">
          View and control channel-to-agent routing. Get rules, update mappings, test routing, lookup session by channel.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
          <Route className="h-5 w-5 text-primary" />
          Routing rules
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Channel to agent mapping. From Gateway or OpenClaw config fallback.
        </p>
        {loading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-foreground-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </p>
        ) : rulesResult?.success ? (
          <div className="mt-4">
            {agentsMap && Object.keys(agentsMap).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground-secondary">
                      <th className="py-2 pr-4 font-medium">Channel</th>
                      <th className="py-2 font-medium">Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(agentsMap).map(([ch, ag]) => (
                      <tr key={ch} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-foreground">{ch}</td>
                        <td className="py-2 font-mono text-foreground-secondary">{ag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-foreground-secondary">
                {rulesResult.message ?? "No routing rules. Gateway may not expose routing tool; check OpenClaw config."}
              </p>
            )}
            {rulesData?.source && (
              <p className="mt-2 text-xs text-foreground-secondary">
                Source: {String(rulesData.source)}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-amber-400">
            {rulesResult?.message ?? "Failed to load routing rules."}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Update routing
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Change channel-to-agent mapping (write; use with care).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm text-foreground-secondary">
            Channel
            <input
              type="text"
              value={updateChannel}
              onChange={(e) => setUpdateChannel(e.target.value)}
              placeholder="e.g. whatsapp"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-foreground-secondary">
            Agent
            <input
              type="text"
              value={updateAgent}
              onChange={(e) => setUpdateAgent(e.target.value)}
              placeholder="e.g. main"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updateLoading || !updateChannel.trim() || !updateAgent.trim()}
            className={cn(
              "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {updateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </button>
        </div>
        {updateResult && (
          <p className={cn("mt-2 text-sm", updateResult.success ? "text-foreground-secondary" : "text-amber-400")}>
            {updateResult.message}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Test routing
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Simulate inbound message routing (dry-run).
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value)}
              placeholder="Channel (optional)"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
            <input
              type="text"
              value={testPeer}
              onChange={(e) => setTestPeer(e.target.value)}
              placeholder="Peer (optional)"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </div>
          <input
            type="text"
            value={testBody}
            onChange={(e) => setTestBody(e.target.value)}
            placeholder="Body (optional)"
            className={cn(
              "rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testLoading}
            className={cn(
              "w-fit rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
          </button>
        </div>
        {testResult && (
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-muted p-3 text-xs text-foreground-secondary">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Get session by channel
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Find session from channel and optional peer.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <input
            type="text"
            value={sessionChannel}
            onChange={(e) => setSessionChannel(e.target.value)}
            placeholder="Channel"
            className={cn(
              "w-40 rounded border border-border bg-background px-3 py-1.5 text-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
          <input
            type="text"
            value={sessionPeer}
            onChange={(e) => setSessionPeer(e.target.value)}
            placeholder="Peer (optional)"
            className={cn(
              "w-40 rounded border border-border bg-background px-3 py-1.5 text-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
          <button
            type="button"
            onClick={handleGetSession}
            disabled={sessionLoading || !sessionChannel.trim()}
            className={cn(
              "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {sessionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </button>
        </div>
        {sessionResult && (
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-muted p-3 text-xs text-foreground-secondary">
            {JSON.stringify(sessionResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
