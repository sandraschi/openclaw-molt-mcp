import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { sessionsApi } from "../services/api";

interface SessionItem {
  key?: string;
  name?: string;
  [key: string]: unknown;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<unknown>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sessionsApi({ operation: "list" });
      if (res.success && res.data) {
        const data = res.data as Record<string, unknown>;
        let list = (data.sessions ?? data.list ?? data) as SessionItem[];
        if (!Array.isArray(list) && typeof data === "object") {
          list = Object.keys(data).length > 0 ? [data as SessionItem] : [];
        }
        setSessions(Array.isArray(list) ? list : []);
      } else {
        setSessions([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleExpand = useCallback(async (sessionKey: string) => {
    if (expanded === sessionKey) {
      setExpanded(null);
      setHistory(null);
      return;
    }
    setExpanded(sessionKey);
    setHistoryLoading(true);
    setHistory(null);
    try {
      const res = await sessionsApi({
        operation: "history",
        session_key: sessionKey,
        args: {},
      });
      if (res.success) {
        setHistory(res.data);
      } else {
        setHistory({ error: res.message ?? res.error });
      }
    } catch (e) {
      setHistory({ error: e instanceof Error ? e.message : "Failed to load history" });
    } finally {
      setHistoryLoading(false);
    }
  }, [expanded]);

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const sessionKeys =
    sessionList.length > 0
      ? sessionList.map((s) => (s.key ?? s.name ?? s.sessionKey ?? "main") as string)
      : ["main"];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Sessions
        </h1>
        <p className="mt-2 text-foreground-secondary">
          OpenClaw sessions (agents). List and view history transcripts.
        </p>
      </section>

      {loading ? (
        <section
          className={cn(
            "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
            "text-center text-foreground-secondary"
          )}
        >
          <p className="font-medium text-foreground">Loading sessions...</p>
        </section>
      ) : error ? (
        <section
          className={cn(
            "rounded-lg border border-destructive/50 bg-destructive/10 p-6",
            "text-destructive"
          )}
        >
          <p className="font-medium">{error}</p>
        </section>
      ) : (
        <section className="space-y-3">
          {sessionKeys.map((key) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleExpand(key)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-3 text-left font-medium text-foreground",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                {expanded === key ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="font-mono">{key}</span>
              </button>
              {expanded === key && (
                <div className="border-t border-border bg-muted/30 px-4 py-4">
                  {historyLoading ? (
                    <p className="text-sm text-muted">Loading history...</p>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground-secondary overflow-x-auto max-h-96 overflow-y-auto">
                      {typeof history === "object" && history !== null
                        ? JSON.stringify(history, null, 2)
                        : String(history ?? "No history")}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {!loading && !error && sessionKeys.length === 0 && (
        <section
          className={cn(
            "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
            "text-center text-foreground-secondary"
          )}
        >
          <MessageSquare className="mb-4 h-12 w-12 text-muted" />
          <p className="font-medium text-foreground">No sessions</p>
          <p className="mt-2 text-sm">Gateway may not be running or no sessions yet.</p>
          <code className="mt-4 rounded bg-muted px-2 py-1 text-xs">clawd_sessions</code>
        </section>
      )}
    </div>
  );
}
