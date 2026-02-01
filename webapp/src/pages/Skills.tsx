import { Layers } from "lucide-react";
import { cn } from "../utils/cn";

export default function Skills() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Skills
        </h1>
        <p className="mt-2 text-foreground-secondary">
          OpenClaw workspace skills. List and read SKILL.md files.
        </p>
      </section>

      <section
        className={cn(
          "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
          "text-center text-foreground-secondary"
        )}
      >
        <Layers className="mb-4 h-12 w-12 text-muted" />
        <p className="font-medium text-foreground">Skills page</p>
        <p className="mt-2 text-sm">TBD: List and read skills from workspace.</p>
        <code className="mt-4 rounded bg-muted px-2 py-1 text-xs">clawd_skills</code>
      </section>
    </div>
  );
}
