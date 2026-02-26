import { Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "../utils/cn";
import { runSecurityAudit, type SecurityAuditResponse } from "../services/api";

const INSTALL_REMOVING =
  "https://github.com/sandraschi/openclaw-molt-mcp/blob/main/INSTALL.md#removing-openclaw";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "border-destructive bg-destructive/10 text-destructive",
  high: "border-destructive/70 bg-destructive/5 text-destructive",
  medium: "border-amber-500/70 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  info: "border-muted bg-muted/50 text-muted-foreground",
};

export default function Security() {
  const [audit, setAudit] = useState<SecurityAuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAudit(null);
    try {
      const res = await runSecurityAudit();
      setAudit(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Security
        </h1>
        <p className="mt-2 text-foreground-secondary">
          OpenClaw security audit and hardening. Audit, check skills, validate config, recommendations, sandbox provisioning.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-mono text-xl font-semibold text-foreground">
              Security Audit
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Run audit, check skills, validate config, and view hardening checklist.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={loading}
            className={cn(
              "rounded-lg border border-border bg-primary px-4 py-2 font-medium text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {loading ? "Running..." : "Run Audit"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {audit && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-mono font-semibold text-foreground">Findings</h3>
              <div className="mt-2 space-y-2">
                {audit.findings.length === 0 ? (
                  <p className="text-sm text-muted">No findings.</p>
                ) : (
                  audit.findings.map((f, i) => (
                    <div
                      key={`${f.id}-${i}`}
                      className={cn(
                        "rounded-lg border px-4 py-3",
                        SEVERITY_COLORS[f.severity] ?? "border-border bg-muted/30"
                      )}
                    >
                      <span className="font-mono text-xs uppercase">{f.severity}</span>
                      <p className="mt-1 font-medium">{f.title}</p>
                      {f.skill && (
                        <p className="mt-1 text-sm opacity-80">Skill: {f.skill}</p>
                      )}
                      {f.details && (
                        <pre className="mt-2 overflow-x-auto text-xs opacity-80">{f.details}</pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {audit.checklist && audit.checklist.length > 0 && (
              <div>
                <h3 className="font-mono font-semibold text-foreground">Hardening Checklist</h3>
                <ul className="mt-2 space-y-2">
                  {audit.checklist.map((c) => (
                    <li key={c.id} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <p className="font-medium">{c.title}</p>
                      <p className="mt-1 text-sm text-foreground-secondary">{c.description}</p>
                      {c.ref && (
                        <a
                          href={c.ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary underline"
                        >
                          Reference
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {audit.playbook && (
              <div>
                <h3 className="font-mono font-semibold text-foreground">
                  Sandbox Provisioning Playbook
                </h3>
                <p className="mt-1 text-sm text-foreground-secondary">{audit.playbook.title}</p>
                <ol className="mt-3 space-y-2">
                  {audit.playbook.steps?.map((s) => (
                    <li key={s.step} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <span className="font-mono text-sm font-medium">Step {s.step}</span>
                      <p className="mt-1 text-sm">{s.action}</p>
                      <p className="mt-1 text-xs text-muted">{s.detail}</p>
                    </li>
                  ))}
                </ol>
                {audit.playbook.references?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audit.playbook.references.map((r, i) => (
                      <a
                        key={i}
                        href={r}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline"
                      >
                        Ref {i + 1}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {!audit && !loading && !error && (
          <div
            className={cn(
              "mt-6 flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8",
              "text-center text-foreground-secondary"
            )}
          >
            <Shield className="mb-2 h-10 w-10 text-muted" />
            <p className="text-sm">Click Run Audit to check Gateway, skills, config, and recommendations.</p>
            <code className="mt-2 rounded bg-muted px-2 py-1 text-xs">clawd_security</code>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Remove OpenClaw
        </h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          If you want to stop using OpenClaw or remove it (e.g. after security advisories or deciding it is not for you), openclaw-molt-mcp does not run uninstall for you. Follow the steps below to disconnect and optionally remove OpenClaw.
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-foreground-secondary">
          <li>Stop the Gateway: quit any running OpenClaw process.</li>
          <li>
            Disconnect openclaw-molt-mcp: unset <code className="rounded bg-muted px-1">OPENCLAW_GATEWAY_URL</code> and{" "}
            <code className="rounded bg-muted px-1">OPENCLAW_GATEWAY_TOKEN</code> where you run the MCP server or webapp API; remove openclaw-molt-mcp from Cursor/Claude Desktop MCP config if you use it.
          </li>
          <li>Uninstall the CLI (optional): <code className="rounded bg-muted px-1">npm uninstall -g openclaw</code>; see OpenClaw docs if you used the install script.</li>
          <li>Remove config (optional): delete <code className="rounded bg-muted px-1">~/.openclaw</code>.</li>
        </ol>
        <a
          href={INSTALL_REMOVING}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-primary underline hover:no-underline"
        >
          Full steps: INSTALL.md – Removing OpenClaw
        </a>
        <p className="mt-2 text-xs text-muted">
          MCP tool: <code className="rounded bg-muted px-1">clawd_openclaw_disconnect</code> returns these steps and the doc link (no side effects).
        </p>
      </section>
    </div>
  );
}
