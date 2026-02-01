import { useEffect, useState } from "react";
import { Plug, Layers, AlertCircle } from "lucide-react";
import { cn } from "../utils/cn";
import {
  fetchGatewayStatus,
  fetchSkills,
  type GatewayStatusResponse,
  type SkillsResponse,
} from "../services/api";

export default function Integrations() {
  const [gateway, setGateway] = useState<GatewayStatusResponse | null>(null);
  const [skills, setSkills] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchGatewayStatus(), fetchSkills()])
      .then(([gw, sk]) => {
        if (!cancelled) {
          setGateway(gw);
          setSkills(sk);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
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
          Integrations
        </h1>
        <p className="mt-2 text-foreground-secondary">
          OpenClaw Gateway status and installed skills. Single source from your OpenClaw setup; not duplication.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-foreground-secondary">Loading...</p>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
              <Plug className="h-5 w-5 text-primary" />
              Gateway
            </h2>
            {gateway?.success ? (
              <p className="mt-2 text-sm text-foreground-secondary">
                {gateway.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-amber-400">
                {gateway?.message ?? "Unreachable. Is OpenClaw running?"}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
              <Layers className="h-5 w-5 text-primary" />
              Skills
            </h2>
            {skills?.skills && skills.skills.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills.skills.map((name) => (
                  <li
                    key={name}
                    className={cn(
                      "rounded bg-muted px-3 py-1.5 font-mono text-sm text-foreground-secondary"
                    )}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-foreground-secondary">
                No skills in workspace. Path: {skills?.path ?? "—"}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
