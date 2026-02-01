import { useEffect, useState } from "react";
import { MessageCircle, Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../utils/cn";
import {
  channelsApi,
  type ChannelsResponse,
  type ChannelsRequest,
} from "../services/api";

export default function Channels() {
  const [listResult, setListResult] = useState<ChannelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [configChannel, setConfigChannel] = useState("");
  const [configResult, setConfigResult] = useState<ChannelsResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  const [sendChannel, setSendChannel] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendResult, setSendResult] = useState<ChannelsResponse | null>(null);
  const [sendLoading, setSendLoading] = useState(false);

  const [recentChannel, setRecentChannel] = useState("");
  const [recentLimit, setRecentLimit] = useState(20);
  const [recentResult, setRecentResult] = useState<ChannelsResponse | null>(null);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    channelsApi({ operation: "list_channels" })
      .then((r) => {
        if (!cancelled) setListResult(r);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGetConfig() {
    if (!configChannel.trim()) return;
    setConfigLoading(true);
    setConfigResult(null);
    try {
      const r = await channelsApi({
        operation: "get_channel_config",
        channel: configChannel.trim(),
      });
      setConfigResult(r);
    } catch (err) {
      setConfigResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setConfigLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!sendMessage.trim()) return;
    setSendLoading(true);
    setSendResult(null);
    try {
      const body: ChannelsRequest = {
        operation: "send_message",
        message: sendMessage.trim(),
      };
      if (sendChannel.trim()) body.channel = sendChannel.trim();
      if (sendTo.trim()) body.to = sendTo.trim();
      const r = await channelsApi(body);
      setSendResult(r);
    } catch (err) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSendLoading(false);
    }
  }

  async function handleGetRecent() {
    if (!recentChannel.trim()) return;
    setRecentLoading(true);
    setRecentResult(null);
    try {
      const r = await channelsApi({
        operation: "get_recent_messages",
        channel: recentChannel.trim(),
        limit: recentLimit,
      });
      setRecentResult(r);
    } catch (err) {
      setRecentResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRecentLoading(false);
    }
  }

  const channelsData = listResult?.data as Record<string, unknown> | undefined;
  const channelsList = Array.isArray(channelsData?.channels)
    ? (channelsData.channels as Record<string, unknown>[])
    : listResult?.success && channelsData
      ? [channelsData]
      : [];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Channels
        </h1>
        <p className="mt-2 text-foreground-secondary">
          List OpenClaw channels, get config, send messages, and fetch recent messages. Requires Gateway channels tool.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" />
          List channels
        </h2>
        {loading ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </p>
        ) : listResult?.success ? (
          <div className="mt-4">
            {channelsList.length > 0 ? (
              <ul className="space-y-2">
                {channelsList.map((ch, i) => (
                  <li
                    key={i}
                    className="rounded bg-muted px-3 py-2 font-mono text-sm text-foreground-secondary"
                  >
                    {typeof ch === "object" && ch !== null
                      ? JSON.stringify(ch)
                      : String(ch)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-secondary">
                {listResult.message ?? "No channels data. Gateway may not expose channels tool yet."}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-amber-400">
            {listResult?.message ?? "Failed to list channels."}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Get channel config
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Read channel-specific settings (allowFrom, routing rules).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm text-foreground-secondary">
            Channel
            <input
              type="text"
              value={configChannel}
              onChange={(e) => setConfigChannel(e.target.value)}
              placeholder="e.g. whatsapp"
              className={cn(
                "w-48 rounded border border-border bg-background px-3 py-1.5 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <button
            type="button"
            onClick={handleGetConfig}
            disabled={configLoading || !configChannel.trim()}
            className={cn(
              "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {configLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get config"}
          </button>
        </div>
        {configResult && (
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-muted p-3 text-xs text-foreground-secondary">
            {JSON.stringify(configResult, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Send message
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Route a message to a channel (optional channel and peer).
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={sendChannel}
              onChange={(e) => setSendChannel(e.target.value)}
              placeholder="Channel (optional)"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
            <input
              type="text"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="To / peer (optional)"
              className={cn(
                "w-40 rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Message (required)"
              className={cn(
                "flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={sendLoading || !sendMessage.trim()}
              className={cn(
                "rounded border border-primary bg-primary px-4 py-2 text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              {sendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {sendResult && (
          <p className={cn("mt-2 text-sm", sendResult.success ? "text-foreground-secondary" : "text-amber-400")}>
            {sendResult.message}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Recent messages
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Pull last N messages from a channel.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <input
            type="text"
            value={recentChannel}
            onChange={(e) => setRecentChannel(e.target.value)}
            placeholder="Channel"
            className={cn(
              "w-48 rounded border border-border bg-background px-3 py-1.5 text-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
          <label className="flex items-center gap-2 text-sm text-foreground-secondary">
            Limit
            <input
              type="number"
              min={1}
              max={100}
              value={recentLimit}
              onChange={(e) => setRecentLimit(Number(e.target.value) || 20)}
              className={cn(
                "w-16 rounded border border-border bg-background px-2 py-1 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <button
            type="button"
            onClick={handleGetRecent}
            disabled={recentLoading || !recentChannel.trim()}
            className={cn(
              "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {recentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
          </button>
        </div>
        {recentResult && (
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-muted p-3 text-xs text-foreground-secondary">
            {JSON.stringify(recentResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
