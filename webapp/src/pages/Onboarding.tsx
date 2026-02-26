import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils/cn";
import {
  fetchOpenClawStatus,
  fetchGatewayStatus,
  fetchMoltbookFeed,
} from "../services/api";

const ONBOARDING_STORAGE_KEY = "openclaw-molt-mcp-onboarding";

interface OnboardingState {
  step: number;
  completed: number[];
  gatewayUrl?: string;
  gatewayToken?: string;
}

const STEPS = [
  { id: 1, title: "OpenClaw CLI", desc: "Check if openclaw CLI is installed" },
  { id: 2, title: "Gateway connection", desc: "Verify OpenClaw Gateway is reachable" },
  { id: 3, title: "Moltbook (optional)", desc: "Check Moltbook API key and connectivity" },
];

export default function Onboarding() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    completed: [],
  });
  const [cliOk, setCliOk] = useState<boolean | null>(null);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);
  const [moltbookOk, setMoltbookOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingState;
        setState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveState = useCallback((next: Partial<OnboardingState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, []);

  const checkStep1 = useCallback(async () => {
    setLoading(true);
    setCliOk(null);
    try {
      const res = await fetchOpenClawStatus();
      const ok = res.cli_installed;
      setCliOk(ok);
      if (ok) {
        saveState({ completed: [...state.completed, 1] });
      }
    } catch {
      setCliOk(false);
    } finally {
      setLoading(false);
    }
  }, [state.completed, saveState]);

  const checkStep2 = useCallback(async () => {
    setLoading(true);
    setGatewayOk(null);
    try {
      const res = await fetchGatewayStatus();
      const ok = res.success;
      setGatewayOk(ok);
      if (ok) {
        saveState({ completed: [...state.completed, 2] });
      }
    } catch {
      setGatewayOk(false);
    } finally {
      setLoading(false);
    }
  }, [state.completed, saveState]);

  const checkStep3 = useCallback(async () => {
    setLoading(true);
    setMoltbookOk(null);
    try {
      const res = await fetchMoltbookFeed(1);
      const ok = res.success;
      setMoltbookOk(ok);
      if (ok) {
        saveState({ completed: [...state.completed, 3] });
      }
    } catch {
      setMoltbookOk(false);
    } finally {
      setLoading(false);
    }
  }, [state.completed, saveState]);

  const handleNext = useCallback(() => {
    saveState({ step: Math.min(state.step + 1, STEPS.length) });
  }, [state.step, saveState]);

  const handlePrev = useCallback(() => {
    saveState({ step: Math.max(state.step - 1, 1) });
  }, [state.step, saveState]);

  const handleCheck = useCallback(() => {
    if (state.step === 1) checkStep1();
    if (state.step === 2) checkStep2();
    if (state.step === 3) checkStep3();
  }, [state.step, checkStep1, checkStep2, checkStep3]);

  const currentStep = STEPS[state.step - 1];
  const isComplete = state.completed.includes(state.step);
  const status =
    state.step === 1
      ? cliOk
      : state.step === 2
        ? gatewayOk
        : state.step === 3
          ? moltbookOk
          : null;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Onboarding
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Multi-step setup: OpenClaw CLI, Gateway, Moltbook. Progress saved in browser.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex gap-2 mb-6">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => saveState({ step: s.id })}
              className={cn(
                "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium",
                state.step === s.id
                  ? "bg-primary/20 text-primary"
                  : state.completed.includes(s.id)
                    ? "bg-muted/50 text-foreground-secondary"
                    : "text-foreground-secondary hover:bg-muted/30"
              )}
            >
              {state.completed.includes(s.id) && <CheckCircle className="h-4 w-4" />}
              {s.title}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-mono text-xl font-semibold">{currentStep?.title}</h2>
          <p className="text-sm text-foreground-secondary">{currentStep?.desc}</p>

          {state.step === 1 && (
            <p className="text-sm">
              Run <code className="rounded bg-muted px-1">openclaw --version</code> to verify. Install via{" "}
              <code className="rounded bg-muted px-1">npm install -g openclaw</code> or see{" "}
              <a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                docs.openclaw.ai
              </a>
              .
            </p>
          )}
          {state.step === 2 && (
            <p className="text-sm">
              Ensure OpenClaw Gateway is running (default <code className="rounded bg-muted px-1">http://127.0.0.1:18789</code>).
              Set <code className="rounded bg-muted px-1">OPENCLAW_GATEWAY_URL</code> and{" "}
              <code className="rounded bg-muted px-1">OPENCLAW_GATEWAY_TOKEN</code> if needed.
            </p>
          )}
          {state.step === 3 && (
            <p className="text-sm">
              Moltbook is optional. Set <code className="rounded bg-muted px-1">MOLTBOOK_API_KEY</code> for feed, search, and post.
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCheck}
              disabled={loading}
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </span>
              ) : (
                "Check"
              )}
            </button>
            {status === true && (
              <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                OK
              </span>
            )}
            {status === false && (
              <span className="text-sm text-destructive">Check failed. See INSTALL.md.</span>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={state.step <= 1}
            className="rounded border border-border px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={state.step >= STEPS.length}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
