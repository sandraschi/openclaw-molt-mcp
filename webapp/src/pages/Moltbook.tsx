import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Save, ExternalLink, Send, CheckCircle, ThumbsUp, Search } from "lucide-react";
import { cn } from "../utils/cn";
import {
  fetchOpenClawStatus,
  registerMoltbookAgent,
  fetchMoltbookFeed,
  searchMoltbook,
  moltbookPost,
  moltbookComment,
  moltbookUpvote,
} from "../services/api";

const STORAGE_KEY = "openclaw-molt-mcp-moltbook-agent-draft";

interface AgentDraft {
  name: string;
  bio: string;
  ideas: string;
  personality: string;
  goals: string;
  updatedAt: string;
}

const defaultDraft: AgentDraft = {
  name: "",
  bio: "",
  ideas: "",
  personality: "",
  goals: "",
  updatedAt: "",
};

type MoltbookTab = "draft" | "feed" | "search";

export default function Moltbook() {
  const [tab, setTab] = useState<MoltbookTab>("draft");
  const [draft, setDraft] = useState<AgentDraft>(defaultDraft);
  const [saved, setSaved] = useState(false);
  const [openclawInstalled, setOpenclawInstalled] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerResult, setRegisterResult] = useState<{ success: boolean; message: string } | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [feedItems, setFeedItems] = useState<unknown[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [postContent, setPostContent] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AgentDraft;
        setDraft({ ...defaultDraft, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchOpenClawStatus()
      .then((r) => setOpenclawInstalled(r.cli_installed))
      .catch(() => setOpenclawInstalled(false));
  }, []);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const res = await fetchMoltbookFeed(20);
      const data = res.data as Record<string, unknown> | undefined;
      const items = (data?.posts ?? data?.feed ?? data ?? []) as unknown[];
      setFeedItems(Array.isArray(items) ? items : []);
    } catch (e) {
      setFeedError(e instanceof Error ? e.message : "Feed failed");
      setFeedItems([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await searchMoltbook(searchQuery.trim());
      const data = res.data;
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  const handlePost = useCallback(async () => {
    if (!postContent.trim()) return;
    setPostLoading(true);
    setPostError(null);
    try {
      await moltbookPost(postContent.trim());
      setPostContent("");
      loadFeed();
    } catch (e) {
      setPostError(e instanceof Error ? e.message : "Post failed");
    } finally {
      setPostLoading(false);
    }
  }, [postContent, loadFeed]);

  const handleUpvote = useCallback(
    async (postId: string) => {
      try {
        await moltbookUpvote(postId);
        loadFeed();
      } catch {
        // ignore
      }
    },
    [loadFeed]
  );

  useEffect(() => {
    if (tab === "feed") loadFeed();
  }, [tab, loadFeed]);

  function handleSave() {
    const next = { ...draft, updatedAt: new Date().toISOString() };
    setDraft(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
    }
  }

  async function handleRegister() {
    if (!draft.name.trim()) {
      setRegisterError("Agent name is required.");
      return;
    }
    handleSave();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterResult(null);
    try {
      const res = await registerMoltbookAgent({
        name: draft.name.trim(),
        bio: draft.bio.trim(),
        personality: draft.personality.trim(),
        goals: draft.goals.trim(),
        ideas: draft.ideas.trim(),
      });
      setRegisterResult({
        success: res.success,
        message: res.message ?? (res.success ? "Registered with Moltbook." : "Registration failed."),
      });
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : String(err));
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-mono text-3xl font-bold text-foreground">
          Moltbook
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Prepare a Moltbook agent, browse feed, search, and post. Requires MOLTBOOK_API_KEY.
        </p>
      </section>

      <section className="flex gap-2 border-b border-border">
        {(["draft", "feed", "search"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 font-medium capitalize",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </section>

      {tab === "feed" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="font-mono font-semibold">New post</h2>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write a post..."
              rows={3}
              className={cn(
                "mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm",
                "focus:border-primary focus:outline-none"
              )}
            />
            <button
              type="button"
              onClick={handlePost}
              disabled={postLoading || !postContent.trim()}
              className="mt-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {postLoading ? "Posting..." : "Post"}
            </button>
            {postError && <p className="mt-2 text-sm text-destructive">{postError}</p>}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono font-semibold">Feed</h2>
              <button
                type="button"
                onClick={loadFeed}
                disabled={feedLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            {feedLoading ? (
              <p className="mt-4 text-sm text-muted">Loading...</p>
            ) : feedError ? (
              <p className="mt-4 text-sm text-destructive">{feedError}</p>
            ) : feedItems.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No posts. Post something or check MOLTBOOK_API_KEY.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {feedItems.map((item, i) => {
                  const post = item as Record<string, unknown>;
                  const id = (post.id ?? post.post_id ?? i) as string;
                  const content = (post.content ?? post.text ?? JSON.stringify(post)) as string;
                  return (
                    <li key={id} className="rounded border border-border bg-muted/20 p-4">
                      <p className="whitespace-pre-wrap text-sm">{content}</p>
                      <button
                        type="button"
                        onClick={() => handleUpvote(id)}
                        className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-foreground"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Upvote
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === "search" && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono font-semibold">Search</h2>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search posts..."
              className={cn(
                "flex-1 rounded border border-border bg-background px-3 py-2 text-sm",
                "focus:border-primary focus:outline-none"
              )}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
          {searchError && <p className="mt-2 text-sm text-destructive">{searchError}</p>}
          {searchLoading ? (
            <p className="mt-4 text-sm text-muted">Searching...</p>
          ) : searchResults.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {searchResults.map((item, i) => {
                const post = item as Record<string, unknown>;
                const content = (post.content ?? post.text ?? JSON.stringify(post)) as string;
                return (
                  <li key={i} className="rounded border border-border bg-muted/20 p-4">
                    <p className="whitespace-pre-wrap text-sm">{content}</p>
                  </li>
                );
              })}
            </ul>
          ) : searchQuery && !searchLoading ? (
            <p className="mt-4 text-sm text-muted">No results.</p>
          ) : null}
        </section>
      )}

      {tab === "draft" && (
      <>
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
          <MessageSquare className="h-5 w-5 text-primary" />
          Prepare agent draft
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Describe your agent for Moltbook. Saved to browser storage; export or copy into OpenClaw/Moltbook config or skill when ready.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Agent name</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. MyMolt"
              className={cn(
                "mt-1 w-full max-w-md rounded border border-border bg-background px-3 py-2 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Bio / description</span>
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short bio for your Moltbook profile"
              rows={2}
              className={cn(
                "mt-1 w-full max-w-2xl rounded border border-border bg-background px-3 py-2 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Personality</span>
            <input
              type="text"
              value={draft.personality}
              onChange={(e) => setDraft((p) => ({ ...p, personality: e.target.value }))}
              placeholder="e.g. helpful, concise, technical"
              className={cn(
                "mt-1 w-full max-w-2xl rounded border border-border bg-background px-3 py-2 text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Goals</span>
            <textarea
              value={draft.goals}
              onChange={(e) => setDraft((p) => ({ ...p, goals: e.target.value }))}
              placeholder="What should this agent do on Moltbook? (e.g. share tips, answer questions)"
              rows={2}
              className={cn(
                "mt-1 w-full max-w-2xl rounded border border-border bg-background px-3 py-2 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Post ideas / content themes</span>
            <textarea
              value={draft.ideas}
              onChange={(e) => setDraft((p) => ({ ...p, ideas: e.target.value }))}
              placeholder="Ideas for posts, topics, or content themes. One per line or free-form."
              rows={5}
              className={cn(
                "mt-1 w-full max-w-2xl rounded border border-border bg-background px-3 py-2 text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 rounded border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved" : "Save draft"}
          </button>
          {openclawInstalled && (
            <button
              type="button"
              onClick={handleRegister}
              disabled={registerLoading || !draft.name.trim()}
              className={cn(
                "flex items-center gap-2 rounded border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground",
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              )}
            >
              <Send className="h-4 w-4" />
              {registerLoading ? "Sending..." : "Register with Moltbook"}
            </button>
          )}
          {draft.updatedAt && (
            <span className="text-xs text-foreground-secondary">
              Last saved: {new Date(draft.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
        {registerError && (
          <p className="mt-3 text-sm text-red-400">{registerError}</p>
        )}
        {registerResult && (
          <div className={cn(
            "mt-3 flex items-center gap-2 rounded border p-3 text-sm",
            registerResult.success
              ? "border-green-500 bg-green-500/10 text-foreground"
              : "border-amber-500 bg-amber-500/10 text-foreground"
          )}>
            {registerResult.success && <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />}
            <span>{registerResult.message}</span>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Preview
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Summary of your draft for reference.
        </p>
        <div className="mt-4 rounded bg-muted/50 p-4 font-mono text-sm text-foreground-secondary">
          <p><span className="text-foreground">Name:</span> {draft.name || "—"}</p>
          <p><span className="text-foreground">Bio:</span> {draft.bio || "—"}</p>
          <p><span className="text-foreground">Personality:</span> {draft.personality || "—"}</p>
          <p><span className="text-foreground">Goals:</span> {draft.goals || "—"}</p>
          <p><span className="text-foreground">Ideas:</span></p>
          <pre className="mt-1 whitespace-pre-wrap text-foreground-secondary">{draft.ideas || "—"}</pre>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          Links
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-foreground-secondary">
          <li>
            <a
              href="https://www.moltbook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              moltbook.com <ExternalLink className="h-3 w-3" />
            </a>
            {" "}
            – Moltbook site
          </li>
          <li>
            <a
              href="https://www.moltbook.com/skill.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              moltbook.com/skill.md <ExternalLink className="h-3 w-3" />
            </a>
            {" "}
            – Moltbook skill for OpenClaw
          </li>
          <li>
            <a
              href="https://www.moltbook.com/heartbeat.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              moltbook.com/heartbeat.md <ExternalLink className="h-3 w-3" />
            </a>
            {" "}
            – Heartbeat pattern for agents
          </li>
        </ul>
      </section>
      </>
      )}
    </div>
  );
}

