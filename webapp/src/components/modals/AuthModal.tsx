import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        className={cn(
          "mx-4 w-full max-w-md rounded-lg border border-border bg-background-secondary shadow-glow animate-fade-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="auth-title" className="font-mono text-lg font-semibold text-foreground">
            Auth
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md p-2 text-foreground-secondary transition-colors",
              "hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-4">
          <p className="text-sm text-foreground-secondary">
            Auth configuration and API keys (Gateway, Moltbook) will be managed here.
          </p>
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-foreground-tertiary">
            TBD: API key inputs, session status, connect/disconnect.
          </div>
        </div>
      </div>
    </div>
  );
}
