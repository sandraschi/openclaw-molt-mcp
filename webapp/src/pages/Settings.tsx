import { Settings } from "lucide-react";
import { cn } from "../utils/cn";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Gateway URL, Moltbook API key, and other configuration.
        </p>
      </section>

      <section
        className={cn(
          "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12",
          "text-center text-foreground-secondary"
        )}
      >
        <Settings className="mb-4 h-12 w-12 text-muted" />
        <p className="font-medium text-foreground">Settings page</p>
        <p className="mt-2 text-sm">TBD: Gateway URL, API keys, CLAWD_MOUNT_VBOX, etc.</p>
      </section>
    </div>
  );
}
