import { type ReactNode } from "react";
import type { SignalType, SignalSeverity } from "@/types";

// ─── Signal Badge ───────────────────────────────────────────────────────────

const SIGNAL_STYLES: Record<SignalType, string> = {
  reward: "signal-reward",
  burn: "signal-burn",
  streak: "signal-streak",
  unstake: "signal-unstake",
};

const SIGNAL_LABELS: Record<SignalType, string> = {
  reward: "Reward",
  burn: "Burn",
  streak: "Streak",
  unstake: "Unstake",
};

const SIGNAL_ICONS: Record<SignalType, string> = {
  reward: "💰",
  burn: "🔥",
  streak: "🚀",
  unstake: "📤",
};

export function SignalBadge({ type }: { type: SignalType }) {
  return (
    <span className={`radar-badge ${SIGNAL_STYLES[type]}`}>
      <span className="text-sm leading-none">{SIGNAL_ICONS[type]}</span>
      {SIGNAL_LABELS[type]}
    </span>
  );
}

// ─── Severity Indicator ─────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<SignalSeverity, string> = {
  low: "bg-radar-text-tertiary",
  medium: "bg-radar-info",
  high: "bg-radar-warning",
  critical: "bg-radar-danger",
};

export function SeverityDot({ severity }: { severity: SignalSeverity }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {(severity === "high" || severity === "critical") && (
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${SEVERITY_COLORS[severity]}`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${SEVERITY_COLORS[severity]}`}
      />
    </span>
  );
}

// ─── Radar Card ─────────────────────────────────────────────────────────────

export function RadarCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`radar-card p-4 ${glow ? "radar-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-radar-border rounded-lg ${className}`}
    />
  );
}

export function SignalCardSkeleton() {
  return (
    <div className="radar-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-4 w-24 ml-auto" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

export function EmptyState({
  icon = "📡",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-radar-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-radar-text-secondary max-w-sm">
        {description}
      </p>
    </div>
  );
}

// ─── Pulse Dot (for live indicator) ─────────────────────────────────────────

export function PulseDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-accent opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-radar-accent" />
    </span>
  );
}

// ─── Score Ring ─────────────────────────────────────────────────────────────

export function ScoreRing({
  score,
  size = 48,
}: {
  score: number;
  size?: number;
}) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "text-radar-accent"
      : score >= 40
        ? "text-radar-warning"
        : "text-radar-text-tertiary";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-radar-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-medium ${color}`}
      >
        {score}
      </span>
    </div>
  );
}
