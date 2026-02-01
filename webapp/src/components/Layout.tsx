import { ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import OpenClawInstallBanner from "./OpenClawInstallBanner";
import HelpModal from "./modals/HelpModal";
import LoggerModal from "./modals/LoggerModal";
import AuthModal from "./modals/AuthModal";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenLogger={() => setLoggerOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-6 py-8",
            "animate-fade-in"
          )}
        >
          <OpenClawInstallBanner />
          {children}
        </main>
      </div>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <LoggerModal isOpen={loggerOpen} onClose={() => setLoggerOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
