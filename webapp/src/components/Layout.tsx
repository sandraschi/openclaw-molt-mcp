import { ReactNode } from "react";
import { cn } from "../utils/cn";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background-secondary px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-semibold text-primary">
            clawd-mcp
          </span>
          <span className="text-foreground-secondary text-sm">
            OpenClaw + Moltbook ecosystem
          </span>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto max-w-6xl px-6 py-8",
          "animate-fade-in"
        )}
      >
        {children}
      </main>
    </div>
  );
}
