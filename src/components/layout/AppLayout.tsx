import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { PulseDot } from "@/components/shared/UIComponents";
import { BadgeShowcase } from "@/components/feed/BadgeShowcase";
import { StakerMarquee } from "@/components/feed/StakerMarquee";
import { useRadarStore } from "@/stores/radarStore";
import { Radio, Bell, Share2, BarChart3, Wallet, HelpCircle } from "lucide-react";
import { isValidAddress } from "@/api";
import { useState } from "react";

// ─── Layout ─────────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-radar-bg flex flex-col">
      <Hero />
      <StakerMarquee />
      <StatusBar />
      <div className="gold-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/rewardradarbanner.png')" }}
    >
      {/* Dark gradient overlay — stronger at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-radar-bg/80 via-radar-bg/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-[10em] pb-3 sm:pb-4 flex flex-col items-center justify-end text-center">
        <img
          src="/title.png"
          alt="Reward Radar"
          className="h-10 sm:h-[2em] w-auto drop-shadow-lg"
        />
        <p className="text-sm sm:text-base text-white/70 mt-2 drop-shadow">
          Real-time opportunity scanner for the{" "}
          <span className="text-radar-accent font-medium">Moats</span>{" "}
          ecosystem
        </p>
      </div>
    </div>
  );
}

// ─── Status Bar (hot signals + scanning live) ───────────────────────────────

function StatusBar() {
  const signals = useRadarStore((s) => s.signals);
  const now = Date.now();
  const criticalCount = signals.filter(
    (s) =>
      (s.severity === "critical" || s.severity === "high") &&
      now - s.timestamp.getTime() < 86_400_000
  ).length;
 
  return (
    <div className="bg-radar-surface/40 border-b border-radar-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-4 h-9">
          {criticalCount > 0 && (
            <span className="radar-badge bg-radar-danger-dim text-radar-danger border border-radar-danger/20 animate-pulse-slow">
              {criticalCount} hot signal{criticalCount !== 1 ? "s" : ""}
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-radar-bg/30 border border-radar-border/50">
            <PulseDot />
            <span className="text-[11px] text-radar-text-secondary font-medium">
              Scanning live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="lg:w-56 flex-shrink-0">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0 scrollbar-none">
        <SidebarLink to="/" icon={<Radio size={16} />} label="Feed" />
        <SidebarLink to="/compare" icon={<BarChart3 size={16} />} label="Compare" />
        <SidebarLink to="/alerts" icon={<Bell size={16} />} label="Alerts" />
        <SidebarLink to="/share" icon={<Share2 size={16} />} label="Share" />
        <div className="hidden lg:block border-t border-radar-border/50 my-1.5" />
        <SidebarLink to="/how-it-works" icon={<HelpCircle size={16} />} label="Guide" mobileLabel="Guide" />
      </nav>
 
      <div className="mt-6 hidden lg:block">
        <WalletInputFull />
      </div>
 
      <div className="mt-4 hidden lg:block">
        <BadgeShowcase />
      </div>
    </aside>
  );
}
 
function SidebarLink({
  to,
  icon,
  label,
  mobileLabel,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  mobileLabel?: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
          isActive
            ? "bg-radar-accent/10 text-radar-accent border border-radar-accent/20"
            : "text-radar-text-secondary hover:text-radar-text-primary hover:bg-radar-surface/50"
        }`
      }
    >
      {icon}
      {mobileLabel ? (
        <>
          <span className="lg:hidden">{mobileLabel}</span>
          <span className="hidden lg:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </NavLink>
  );
}

// ─── Wallet Input (full, for sidebar) ───────────────────────────────────────

function WalletInputFull() {
  const walletAddress = useRadarStore((s) => s.walletAddress);
  const setWalletAddress = useRadarStore((s) => s.setWalletAddress);
  const [input, setInput] = useState(walletAddress);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setWalletAddress("");
      setError("");
      return;
    }

    if (!isValidAddress(trimmed)) {
      setError("Invalid address");
      return;
    }

    setWalletAddress(trimmed);
    setError("");
  };

  return (
    <div>
      <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-2">
        Filter by wallet
      </label>
      <div className="relative">
        <Wallet
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-text-tertiary"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onBlur={handleSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0x..."
          className={`w-full bg-radar-surface border rounded-lg pl-8 pr-3 py-2 text-[11px] font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none transition-colors ${
            error
              ? "border-radar-danger/50"
              : "border-radar-border focus:border-radar-accent/40"
          }`}
        />
      </div>
      {error && (
        <p className="text-[10px] text-radar-danger mt-1">{error}</p>
      )}
      {walletAddress && !error && (
        <button
          onClick={() => {
            setInput("");
            setWalletAddress("");
          }}
          className="text-[10px] text-radar-text-tertiary hover:text-radar-text-secondary mt-1 transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-radar-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
        <p className="text-xs text-radar-text-tertiary">
          {new Date().getFullYear()} &middot; Reward Radar &middot; Powered by{" "}
          <a
            href="https://moats.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-radar-accent hover:underline"
          >
            The Moats
          </a>
        </p>
        <p className="text-[11px] text-radar-text-tertiary mt-1.5">
          Created by{" "}
          <a
            href="https://x.com/vicdelarge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-radar-accent hover:underline"
          >
            @vicdelarge
          </a>
        </p>
      </div>
    </footer>
  );
}