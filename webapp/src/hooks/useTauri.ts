import { useEffect, useState } from "react";

type TauriBackendStatus = "starting" | "ready" | "error" | "not-tauri";

const IN_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Minimal Tauri desktop-shell integration.
 *
 * The native shell (native/) exposes a `start_backend` command and emits
 * `backend-status` events. This hook wires those up only when the webapp is
 * running inside the Tauri window; in a plain browser it is inert (returns
 * "not-tauri") so dev mode on :10744 is unaffected.
 */
export function useTauriBackend() {
  const [status, setStatus] = useState<TauriBackendStatus>(IN_TAURI ? "starting" : "not-tauri");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!IN_TAURI) return;
    let unlisten: (() => void) | undefined;

    (async () => {
      const { listen } = await import("@tauri-apps/api/event");
      const { invoke } = await import("@tauri-apps/api/core");

      try {
        unlisten = await listen<string>("backend-status", (event) => {
          setMessage(event.payload);
          setStatus(event.payload.startsWith("error") ? "error" : "ready");
        });
      } catch {
        // listener registration failed; fall through to invoke
      }

      try {
        const msg = await invoke<string>("start_backend");
        setMessage(msg);
        setStatus("ready");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();

    return () => {
      unlisten?.();
    };
  }, []);

  return { inTauri: IN_TAURI, status, message };
}
