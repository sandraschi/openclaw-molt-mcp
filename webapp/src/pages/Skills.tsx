import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { fetchSkillContent, fetchSkills } from "../services/api";

export default function Skills() {
  const [skills, setSkills] = useState<string[]>([]);
  const [path, setPath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSkills();
      setSkills(res.skills ?? []);
      setPath(res.path ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleExpand = useCallback(async (name: string) => {
    if (expanded === name) {
      setExpanded(null);
      setContent(null);
      return;
    }
    setExpanded(name);
    setContentLoading(true);
    setContent(null);
    try {
      const res = await fetchSkillContent(name);
      setContent(res.content ?? "");
    } catch (e) {
      setContent(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setContentLoading(false);
    }
  }, [expanded]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Skills
        </h1>
        <p className="mt-2 text-foreground-secondary">
          OpenClaw workspace skills. List and read SKILL.md files.
        </p>
        {path && (
          <p className="mt-1 font-mono text-xs text-muted">{path}</p>
        )}
      </section>

      {loading ? (
        <section
          className={cn(
            "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
            "text-center text-foreground-secondary"
          )}
        >
          <p className="font-medium text-foreground">Loading skills...</p>
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
      ) : skills.length === 0 ? (
        <section
          className={cn(
            "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
            "text-center text-foreground-secondary"
          )}
        >
          <Layers className="mb-4 h-12 w-12 text-muted" />
          <p className="font-medium text-foreground">No skills found</p>
          <p className="mt-2 text-sm">Add skills to your workspace skills directory.</p>
          <code className="mt-4 rounded bg-muted px-2 py-1 text-xs">clawd_skills</code>
        </section>
      ) : (
        <section className="space-y-3">
          {skills.map((name) => (
            <div
              key={name}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleExpand(name)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-3 text-left font-medium text-foreground",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                {expanded === name ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="font-mono">{name}</span>
              </button>
              {expanded === name && (
                <div className="border-t border-border bg-muted/30 px-4 py-4">
                  {contentLoading ? (
                    <p className="text-sm text-muted">Loading content...</p>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground-secondary overflow-x-auto">
                      {content ?? ""}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
