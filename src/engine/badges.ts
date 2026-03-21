import type { Signal, AlertRule } from "@/types";

// ─── Badge Definitions ──────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
}

export interface EarnedBadge extends Badge {
  earnedAt: Date;
}

const BADGE_DEFS: Badge[] = [
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Caught a signal within 5 minutes of it happening",
    icon: "\u{1F426}", // 🐦
    tier: "gold",
  },
  {
    id: "whale-watcher",
    name: "Whale Watcher",
    description: "Spotted a top-ranked wallet move",
    icon: "\u{1F433}", // 🐳
    tier: "gold",
  },
  {
    id: "burn-notice",
    name: "Burn Notice",
    description: "Witnessed a burn or early exit signal",
    icon: "\u{1F525}", // 🔥
    tier: "bronze",
  },
  {
    id: "signal-hunter",
    name: "Signal Hunter",
    description: "Collected 10+ signals",
    icon: "\u{1F3AF}", // 🎯
    tier: "silver",
  },
  {
    id: "moat-explorer",
    name: "Moat Explorer",
    description: "Signals from 3+ different Moats",
    icon: "\u{1F9ED}", // 🧭
    tier: "silver",
  },
  {
    id: "alert-pro",
    name: "Alert Pro",
    description: "Configured a Discord alert rule",
    icon: "\u{1F514}", // 🔔
    tier: "bronze",
  },
  {
    id: "critical-eye",
    name: "Critical Eye",
    description: "Detected a critical severity signal",
    icon: "\u{1F441}", // 👁
    tier: "gold",
  },
  {
    id: "streak-spotter",
    name: "Streak Spotter",
    description: "Caught a hot streak signal",
    icon: "\u{26A1}", // ⚡
    tier: "silver",
  },
];

// ─── Badge Detection ────────────────────────────────────────────────────────

/**
 * Evaluates all badge criteria against current state.
 * Returns the full set of badges the user has earned.
 * Called on every signal update — fast, no side effects.
 */
export function evaluateBadges(
  signals: Signal[],
  alertRules: AlertRule[]
): EarnedBadge[] {
  const earned: EarnedBadge[] = [];
  const now = Date.now();

  // Early Bird — any signal with timestamp < 5 min old
  const earlySignal = signals.find(
    (s) => now - s.timestamp.getTime() < 300_000
  );
  if (earlySignal) {
    earned.push(award("early-bird", earlySignal.timestamp));
  }

  // Whale Watcher — any signal with isTopWallet in meta
  const whaleSignal = signals.find((s) => s.meta.isTopWallet === true);
  if (whaleSignal) {
    earned.push(award("whale-watcher", whaleSignal.timestamp));
  }

  // Burn Notice — any burn-type signal
  const burnSignal = signals.find((s) => s.type === "burn");
  if (burnSignal) {
    earned.push(award("burn-notice", burnSignal.timestamp));
  }

  // Signal Hunter — 10+ total signals
  if (signals.length >= 10) {
    earned.push(award("signal-hunter"));
  }

  // Moat Explorer — signals from 3+ unique contracts
  const uniqueContracts = new Set(
    signals.filter((s) => s.contractAddress).map((s) => s.contractAddress.toLowerCase())
  );
  if (uniqueContracts.size >= 3) {
    earned.push(award("moat-explorer"));
  }

  // Alert Pro — at least one alert rule configured
  if (alertRules.length > 0) {
    earned.push(award("alert-pro"));
  }

  // Critical Eye — any critical severity signal
  const criticalSignal = signals.find((s) => s.severity === "critical");
  if (criticalSignal) {
    earned.push(award("critical-eye", criticalSignal.timestamp));
  }

  // Streak Spotter — any streak signal
  const streakSignal = signals.find((s) => s.type === "streak");
  if (streakSignal) {
    earned.push(award("streak-spotter", streakSignal.timestamp));
  }

  return earned;
}

/** Get all badge definitions (for displaying locked badges) */
export function getAllBadges(): Badge[] {
  return BADGE_DEFS;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function award(badgeId: string, timestamp?: Date): EarnedBadge {
  const def = BADGE_DEFS.find((b) => b.id === badgeId);
  if (!def) throw new Error(`Unknown badge: ${badgeId}`);

  return {
    ...def,
    earnedAt: timestamp ?? new Date(),
  };
}
