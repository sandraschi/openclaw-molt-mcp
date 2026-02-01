import { useEffect } from "react";
import { useLog } from "../context/LogContext";

/** Registers global error handler and initial client log. Mount once inside LogProvider. */
export default function LogBootstrap() {
  const { addLog } = useLog();

  useEffect(() => {
    addLog({
      ts: new Date().toISOString(),
      level: "INFO",
      msg: "App initialized",
      source: "client",
    });
    const handleError = (event: ErrorEvent) => {
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: event.message ?? String(event),
        source: "client",
      });
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      addLog({
        ts: new Date().toISOString(),
        level: "ERROR",
        msg: `Unhandled rejection: ${msg}`,
        source: "client",
      });
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [addLog]);

  return null;
}
