import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { PulseDot } from "@/components/shared/UIComponents";
import { useRadarStore } from "@/stores/radarStore";
import { Radio, Bell, Share2, Search } from "lucide-react";
import { isValidAddress } from "@/api";
import { useState } from "react";

// ─── Layout ─────────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-radar-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function Header() {
  const signals = useRadarStore((s) => s.signals);
  const criticalCount = signals.filter((s) => s.severity === "critical" || s.severity === "high").length;

  return (
    <header className="sticky top-0 z-50 bg-radar-bg/80 backdrop-blur-xl border-b border-radar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-radar-accent to-emerald-500 flex items-center justify-center">
            <Radio size={16} className="text-radar-bg" />
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold text-radar-text-primary leading-none">
              Reward Radar
            </h1>
            <p className="text-[10px] text-radar-text-tertiary leading-none mt-0.5">
              Moats opportunity scanner
            </p>
          </div>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2 ml-auto">
          {criticalCount > 0 && (
            <span className="radar-badge bg-radar-danger-dim text-radar-danger border border-radar-danger/20">
              {criticalCount} hot
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-radar-text-secondary">
            <PulseDot />
            <span className="hidden sm:inline">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="lg:w-56 flex-shrink-0">
      <nav className="flex lg:flex-col gap-1">
        <SidebarLink to="/" icon={<Radio size={16} />} label="Feed" />
        <SidebarLink to="/alerts" icon={<Bell size={16} />} label="Alerts" />
        <SidebarLink to="/share" icon={<Share2 size={16} />} label="Share" />
      </nav>

      {/* Wallet input */}
      <div className="mt-6 hidden lg:block">
        <WalletInput />
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-radar-surface border border-radar-border text-radar-text-primary"
            : "text-radar-text-secondary hover:text-radar-text-primary hover:bg-radar-surface/50"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

// ─── Wallet Input ───────────────────────────────────────────────────────────

function WalletInput() {
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
        <Search
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
          className="w-full bg-radar-surface border border-radar-border rounded-lg pl-8 pr-3 py-2 text-[11px] font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none focus:border-radar-accent/50 transition-colors"
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
