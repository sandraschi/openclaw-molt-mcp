import { useState } from "react";
import { Globe, FileCode, ExternalLink } from "lucide-react";
import { cn } from "../utils/cn";
import { generateLandingPage, type LandingPageRequest } from "../services/api";

const DEPLOY_HINTS = [
  {
    name: "GitHub Pages",
    url: "https://pages.github.com",
    hint: "Push the www folder to a repo, then Settings > Pages > Deploy from branch.",
  },
  {
    name: "Netlify",
    url: "https://netlify.com",
    hint: "Drag and drop the www folder or connect Git and set Publish directory to www.",
  },
  {
    name: "Vercel",
    url: "https://vercel.com",
    hint: "Import Git repo; set Root/Output directory to the folder containing www.",
  },
  {
    name: "Cloudflare Pages",
    url: "https://pages.cloudflare.com",
    hint: "Direct Upload the www folder or connect Git; set build output to www.",
  },
];

const DEFAULT_FEATURES = [
  "Blazing Fast: Engineered for maximum velocity and minimum drag.",
  "Secure by Design: Fort Knox level security for your data.",
  "Open Source: Transparency is key. Code is law.",
];

export default function StarterPage() {
  const [projectName, setProjectName] = useState("India Claw");
  const [heroTitle, setHeroTitle] = useState("India Claw");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Your AI presence on the web. Built with OpenClaw and clawd-mcp."
  );
  const [featuresText, setFeaturesText] = useState(DEFAULT_FEATURES.join("\n"));
  const [githubUrl, setGithubUrl] = useState("https://github.com");
  const [authorName, setAuthorName] = useState("Developer");
  const [authorBio, setAuthorBio] = useState(
    "I build things. Powered by OpenClaw, Moltbook, and clawd-mcp."
  );
  const [donateLink, setDonateLink] = useState("#");
  const [heroImageKeyword, setHeroImageKeyword] = useState("technology");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ path: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    const name = projectName.trim();
    if (!name) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const body: LandingPageRequest = {
      project_name: name,
      hero_title: heroTitle.trim() || "The Next Big Thing",
      hero_subtitle: heroSubtitle.trim(),
      features: features.length > 0 ? features : undefined,
      github_url: githubUrl.trim(),
      author_name: authorName.trim(),
      author_bio: authorBio.trim(),
      donate_link: donateLink.trim(),
      hero_image_keyword: heroImageKeyword.trim() || "technology",
    };
    try {
      const res = await generateLandingPage(body);
      if (res.success && res.path && res.message) {
        setResult({ path: res.path, message: res.message });
      } else {
        setError(res.message ?? "Generation failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="flex items-center gap-2 font-mono text-3xl font-bold text-foreground">
          <Globe className="h-8 w-5 text-primary" />
          Starter page
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Generate a simple hero landing site for your web presence (e.g. "India Claw"). Static HTML/CSS/JS plus a DEPLOY.md with hints on how to get it online.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-mono text-xl font-semibold text-foreground">
          <FileCode className="h-5 w-5 text-primary" />
          Generate landing page
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Fill in project name and hero title (e.g. India Claw). Features: one per line, optional "Title: Description" format. Output is written to the server (default: ./generated/&lt;project_slug&gt;/www). Set LANDING_PAGE_OUTPUT_DIR to change.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground-secondary">Project name</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. India Claw"
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Hero title</span>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="e.g. India Claw"
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Hero image keyword</span>
            <input
              type="text"
              value={heroImageKeyword}
              onChange={(e) => setHeroImageKeyword(e.target.value)}
              placeholder="e.g. technology"
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground-secondary">Hero subtitle</span>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Short tagline"
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground-secondary">Features (one per line, optional "Title: Description")</span>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
              placeholder="Blazing Fast: Engineered for speed."
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">Author name</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground-secondary">GitHub URL</span>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground-secondary">Author bio</span>
            <textarea
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              rows={2}
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground-secondary">Donate link (Patreon, Ko-fi, etc.)</span>
            <input
              type="url"
              value={donateLink}
              onChange={(e) => setDonateLink(e.target.value)}
              placeholder="#"
              className={cn(
                "mt-1 w-full rounded border border-border bg-background px-4 py-2 font-mono text-sm text-foreground",
                "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              )}
            />
          </label>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "rounded border border-primary bg-primary px-4 py-2 text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            )}
          >
            {loading ? "Generating..." : "Generate landing page"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
        {result && (
          <div className="mt-4 rounded bg-muted p-4 text-sm text-foreground-secondary">
            <p className="font-medium text-foreground">{result.message}</p>
            <p className="mt-2 font-mono text-foreground-tertiary">{result.path}</p>
            <p className="mt-2">Open index.html in a browser. See DEPLOY.md in the project folder for how to get it online.</p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-xl font-semibold text-foreground">
          How to get your page online
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          After generating, upload the contents of the www folder to any static host. No build step. DEPLOY.md in the project folder has the same hints.
        </p>
        <ul className="mt-4 space-y-4">
          {DEPLOY_HINTS.map((d) => (
            <li key={d.name} className="flex flex-col gap-1">
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
              >
                {d.name}
                <ExternalLink className="h-4 w-4" />
              </a>
              <span className="text-sm text-foreground-secondary">{d.hint}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
