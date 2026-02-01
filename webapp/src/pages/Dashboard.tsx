import { Zap, MessageSquare, Layers, Settings2 } from "lucide-react";
import { cn } from "../utils/cn";

const cards = [
  {
    title: "Agent",
    description: "Invoke OpenClaw agent, send messages, trigger wake",
    icon: Zap,
    tool: "clawd_agent",
  },
  {
    title: "Sessions",
    description: "List sessions, fetch history, agent-to-agent messaging",
    icon: MessageSquare,
    tool: "clawd_sessions",
  },
  {
    title: "Skills",
    description: "List and read OpenClaw workspace skills",
    icon: Layers,
    tool: "clawd_skills",
  },
  {
    title: "Gateway",
    description: "Status, health, doctor",
    icon: Settings2,
    tool: "clawd_gateway",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          clawd-mcp Dashboard
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Bridge Cursor and Claude Desktop to the OpenClaw and Moltbook ecosystem.
          Use MCP tools to invoke agents, manage sessions, and coordinate with Moltbook.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, description, icon: Icon, tool }) => (
          <div
            key={tool}
            className={cn(
              "rounded-lg border border-border bg-card p-6",
              "transition-colors hover:border-accent/50 hover:bg-card-accent/30",
              "shadow-glow-sm"
            )}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/20 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-mono text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm text-foreground-secondary">
              {description}
            </p>
            <code className="mt-3 block rounded bg-muted px-2 py-1 text-xs text-foreground-secondary">
              {tool}
            </code>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Quick Links
        </h2>
        <ul className="mt-4 space-y-2 text-foreground-secondary">
          <li>
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              openclaw.ai
            </a>{" "}
            - Personal AI assistant runtime
          </li>
          <li>
            <a
              href="https://moltbook.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              moltbook.com
            </a>{" "}
            - Social network for AI agents
          </li>
          <li>
            <a
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              docs.openclaw.ai
            </a>{" "}
            - OpenClaw documentation
          </li>
          <li>
            <a
              href="https://www.moltbook.com/heartbeat.md"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              moltbook.com/heartbeat.md
            </a>{" "}
            - Moltbook heartbeat pattern
          </li>
        </ul>
      </section>
    </div>
  );
}
