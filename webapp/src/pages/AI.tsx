import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";
import {
  fetchOllamaHealth,
  fetchOllamaTags,
  ollamaGenerate,
  ollamaChat,
  ollamaPull,
  ollamaDelete,
  type OllamaModelInfo,
  type ChatMessagePayload,
} from "../services/api";
import { useLog } from "../context/LogContext";

const SHORTCUTS = [
  { label: "Explain last log", prompt: "Summarize the last 20 lines of the clawd-mcp log file and explain any errors or warnings." },
  { label: "Summarize security findings", prompt: "List and briefly explain the main security recommendations for running OpenClaw (gateway binding, skills, sandbox)." },
  { label: "OpenClaw vs Moltbook", prompt: "In 3 short bullets: what is OpenClaw, what is Moltbook, and how do they relate?" },
];

export default function AI() {
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [models, setModels] = useState<OllamaModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quickPrompt, setQuickPrompt] = useState("");
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessagePayload[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [pullName, setPullName] = useState("");
  const [pullLoading, setPullLoading] = useState(false);
  const [deletingModel, setDeletingModel] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addLog } = useLog();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [health, tags] = await Promise.all([
          fetchOllamaHealth(),
          fetchOllamaTags(),
        ]);
        if (!cancelled) {
          setOllamaOk(health.ok);
          setModels(tags.models ?? []);
          if (tags.models?.length && !selectedModel) {
            setSelectedModel(tags.models[0].name ?? "");
          }
        }
      } catch {
        if (!cancelled) setOllamaOk(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (models.length && !selectedModel) setSelectedModel(models[0].name ?? "");
  }, [models, selectedModel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleQuickPrompt() {
    const prompt = quickPrompt.trim();
    if (!prompt || !selectedModel) return;
    setQuickLoading(true);
    setQuickError(null);
    setQuickResponse(null);
    try {
      const res = await ollamaGenerate({ model: selectedModel, prompt });
      setQuickResponse(res.response ?? "");
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setQuickError(text);
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: `Ollama generate failed: ${text}`,
        source: "client",
      });
    } finally {
      setQuickLoading(false);
    }
  }

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || !selectedModel) return;
    const userMsg: ChatMessagePayload = { role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const messages: ChatMessagePayload[] = [...chatMessages, userMsg];
      const res = await ollamaChat({ model: selectedModel, messages });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response ?? "" },
      ]);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : String(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorText}` },
      ]);
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: `Ollama chat failed: ${errorText}`,
        source: "client",
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function handlePull() {
    const name = pullName.trim();
    if (!name) return;
    setPullLoading(true);
    try {
      await ollamaPull(name);
      const tags = await fetchOllamaTags();
      setModels(tags.models ?? []);
      setPullName("");
    } catch (err) {
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: `Ollama pull failed: ${err instanceof Error ? err.message : err}`,
        source: "client",
      });
    } finally {
      setPullLoading(false);
    }
  }

  async function handleDelete(modelName: string) {
    setDeletingModel(modelName);
    try {
      await ollamaDelete(modelName);
      setModels((prev) => {
        const next = prev.filter((m) => m.name !== modelName);
        if (selectedModel === modelName) setSelectedModel(next[0]?.name ?? "");
        return next;
      });
    } catch (err) {
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: `Ollama delete failed: ${err instanceof Error ? err.message : err}`,
        source: "client",
      });
    } finally {
      setDeletingModel(null);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">AI</h1>
        <p className="mt-2 text-foreground-secondary">
          Local LLM via Ollama. Quick prompt, shortcuts, and chat. Requires Ollama running (e.g. localhost:11434).
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Ollama status
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Health and model list from webapp API proxy to Ollama.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium",
              ollamaOk === null
                ? "bg-muted text-foreground-secondary"
                : ollamaOk
                  ? "bg-green-900/40 text-green-300"
                  : "bg-red-900/40 text-red-300"
            )}
          >
            {ollamaOk === null ? "Checking..." : ollamaOk ? "Ollama reachable" : "Ollama unreachable"}
          </span>
          <label className="flex items-center gap-2 text-sm text-foreground-secondary">
            Model:
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={cn(
                "rounded border border-border bg-background px-2 py-1 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            >
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
              {!models.length && <option value="">No models</option>}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-foreground-secondary">Models</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground-secondary">
            {models.length === 0 && ollamaOk !== null && (
              <li>No models. Pull one below.</li>
            )}
            {models.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-2">
                <span className="font-mono">{m.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(m.name)}
                  disabled={deletingModel === m.name}
                  className={cn(
                    "rounded border border-border px-2 py-0.5 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                  )}
                >
                  {deletingModel === m.name ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={pullName}
              onChange={(e) => setPullName(e.target.value)}
              placeholder="Model name (e.g. llama3.2)"
              className={cn(
                "flex-1 max-w-xs rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
              disabled={!ollamaOk || pullLoading}
            />
            <button
              type="button"
              onClick={handlePull}
              disabled={!ollamaOk || pullLoading || !pullName.trim()}
              className={cn(
                "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              {pullLoading ? "Pulling..." : "Pull"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Quick prompt
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          One-off generate with selected model. No chat history.
        </p>
        <div className="mt-4 flex gap-2">
          <textarea
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="Ask something..."
            rows={2}
            className={cn(
              "flex-1 rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
            disabled={quickLoading || !ollamaOk}
          />
          <button
            type="button"
            onClick={handleQuickPrompt}
            disabled={quickLoading || !ollamaOk || !selectedModel || !quickPrompt.trim()}
            className={cn(
              "rounded border border-primary bg-primary px-4 py-2 text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            )}
          >
            {quickLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {quickError && <p className="mt-2 text-sm text-red-400">{quickError}</p>}
        {quickResponse && (
          <div className="mt-3 rounded bg-muted p-3 text-sm text-foreground-secondary whitespace-pre-wrap">
            {quickResponse}
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium text-foreground-secondary">Shortcuts</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {SHORTCUTS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setQuickPrompt(s.prompt)}
                className={cn(
                  "rounded border border-border bg-muted px-3 py-1.5 text-xs text-foreground-secondary",
                  "hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Chat
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Conversation with system preprompt (OpenClaw/Moltbook context). Uses selected model.
        </p>
        <div className="mt-4 flex h-64 flex-col overflow-hidden rounded border border-border bg-background">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.length === 0 && (
              <p className="text-sm text-foreground-secondary">No messages yet. Send one below.</p>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-8 bg-primary/20 text-foreground"
                    : "mr-8 bg-muted text-foreground-secondary"
                )}
              >
                <span className="font-medium text-foreground-secondary">{msg.role}: </span>
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
              placeholder="Type a message..."
              className={cn(
                "flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
              disabled={chatLoading || !ollamaOk}
            />
            <button
              type="button"
              onClick={handleChatSend}
              disabled={chatLoading || !ollamaOk || !selectedModel || !chatInput.trim()}
              className={cn(
                "rounded border border-primary bg-primary px-4 py-2 text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
