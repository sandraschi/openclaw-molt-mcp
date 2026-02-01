import { useEffect, useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { cn } from "../utils/cn";
import { fetchClawNews, type ClawNewsItem } from "../services/api";

export default function Clawnews() {
  const [items, setItems] = useState<ClawNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchClawNews()
      .then((res) => {
        if (!cancelled && res.success) setItems(res.items);
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
          Clawnews
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Today&apos;s media echo: recent OpenClaw and Moltbook news and docs. Curated; update periodically.
        </p>
      </section>

      {error && (
        <p className="rounded border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-foreground-secondary">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.url}
              className={cn(
                "rounded-lg border border-border bg-card p-4",
                "transition-colors hover:border-primary/50 hover:bg-card-accent/30"
              )}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3"
              >
                <Newspaper className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-foreground hover:underline">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs text-foreground-tertiary">
                    {item.source} · {item.date}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-foreground-tertiary" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
