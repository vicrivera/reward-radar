import type {
  MoatEvent,
  MoatPointsEntry,
  Signal,
  SignalSeverity,
  RankSnapshot,
} from "@/types";
import { formatTokenAmount, getTokenInfo, truncateAddress, getMoatInfo } from "@/utils";

// ─── Signal ID Generator ────────────────────────────────────────────────────
// Uses event IDs when available so the same event never produces duplicate signals.

function makeSignalId(prefix: string, eventId?: string): string {
  if (eventId) return `${prefix}-${eventId}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Token-Aware Severity ──────────────────────────────────────────────────
// Calibrated against real Moats API data:
// - USDC amounts are in 6 decimals (234271 = $0.23)
// - WAVAX amounts are in 18 decimals (22235797971061259 = 0.022 AVAX)
// - HEFE/CAMRY are in 18 decimals with large raw numbers
// We convert to a human-readable value first, then apply token-class thresholds.

const STABLECOIN_TOKENS = new Set([
  "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", // USDC
]);

const NATIVE_TOKENS = new Set([
  "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
]);

function tokenAwareSeverity(
  weiAmount: string,
  tokenAddress?: string
): SignalSeverity {
  const info = tokenAddress ? getTokenInfo(tokenAddress) : { decimals: 18 };
  const value = Number(BigInt(weiAmount)) / 10 ** info.decimals;
  const lower = tokenAddress?.toLowerCase() ?? "";

  // Stablecoins — dollar thresholds
  if (STABLECOIN_TOKENS.has(lower)) {
    if (value >= 500) return "critical";
    if (value >= 50) return "high";
    if (value >= 5) return "medium";
    return "low";
  }

  // WAVAX — AVAX-denominated thresholds
  if (NATIVE_TOKENS.has(lower)) {
    if (value >= 50) return "critical";
    if (value >= 5) return "high";
    if (value >= 0.5) return "medium";
    return "low";
  }

  // Ecosystem tokens (HEFE, CAMRY, BSGG, etc.) — token count thresholds
  if (value >= 10_000) return "critical";
  if (value >= 1_000) return "high";
  if (value >= 100) return "medium";
  return "low";
}

// Same logic but for native-denominated amounts (burns, exits, unstakes)
// These don't have a token address — they're denominated in the Moat's staked token.
function stakeAmountSeverity(weiAmount: string): SignalSeverity {
  const value = Number(BigInt(weiAmount)) / 1e18;

  if (value >= 50_000) return "critical";
  if (value >= 10_000) return "high";
  if (value >= 1_000) return "medium";
  return "low";
}

// ─── Reward Drop Detector ──────────────────────────────────────────────────
// Two signal types:
//   1. Individual large claims (single event worth noting)
//   2. Cluster signals (multiple claims on same contract = active reward distribution)
// Window defaults to 24h because the API only returns 100 events total.

export function detectRewardSignals(
  events: MoatEvent[],
  windowMs: number = 86_400_000 // 24 hours
): Signal[] {
  const now = Date.now();
  const rewardEvents = events.filter(
    (e) => e.eventType === "RewardClaimed" && now - e.timestamp.getTime() < windowMs
  );

  const signals: Signal[] = [];

  // ── Individual large claims ──
  for (const event of rewardEvents) {
    if (!event.token || !event.amount) continue;

    const severity = tokenAwareSeverity(event.amount, event.token);
    if (severityRank(severity) < severityRank("medium")) continue; // Skip noise

    const info = getTokenInfo(event.token);
    const formatted = formatTokenAmount(event.amount, info.decimals, 2);
    const userLabel = truncateAddress(event.user);

    signals.push({
      id: makeSignalId("reward", event.id),
      type: "reward",
      severity,
      title: `${info.symbol} reward claimed`,
      description: `${userLabel} claimed ${formatted} ${info.symbol}`,
      contractAddress: event.contractAddress,
      timestamp: event.timestamp,
      eventIds: [event.id],
      meta: {
        user: event.user,
        token: event.token,
        amount: event.amount,
        txHash: event.txHash,
      },
    });
  }

  // ── Cluster signals (multiple claims on same contract) ──
  const byContract = new Map<string, MoatEvent[]>();
  for (const event of rewardEvents) {
    const existing = byContract.get(event.contractAddress) ?? [];
    existing.push(event);
    byContract.set(event.contractAddress, existing);
  }

  for (const [contractAddress, contractEvents] of byContract) {
    if (contractEvents.length < 3) continue; // Need 3+ claims to signal a cluster

    // Count unique claimers
    const uniqueClaimers = new Set(contractEvents.map((e) => e.user)).size;

    // Aggregate per token
    const tokenTotals = new Map<string, bigint>();
    for (const event of contractEvents) {
      if (event.token && event.amount) {
        const current = tokenTotals.get(event.token) ?? 0n;
        tokenTotals.set(event.token, current + BigInt(event.amount));
      }
    }

    const summaries = Array.from(tokenTotals.entries()).map(([addr, total]) => {
      const info = getTokenInfo(addr);
      return `${formatTokenAmount(total.toString(), info.decimals, 2)} ${info.symbol}`;
    });

    // Severity based on cluster size and unique claimers
    const clusterSeverity: SignalSeverity =
      uniqueClaimers >= 5 ? "critical" :
      uniqueClaimers >= 3 ? "high" :
      contractEvents.length >= 5 ? "medium" : "low";

    signals.push({
      id: makeSignalId("reward-cluster", contractAddress),
      type: "reward",
      severity: clusterSeverity,
      title: `Active reward distribution`,
      description: `${contractEvents.length} claims by ${uniqueClaimers} wallet${uniqueClaimers > 1 ? "s" : ""}: ${summaries.join(", ")}`,
      contractAddress,
      timestamp: contractEvents[0]!.timestamp,
      eventIds: contractEvents.map((e) => e.id),
      meta: {
        claimCount: contractEvents.length,
        uniqueClaimers,
      },
    });
  }

  return signals;
}

// ─── Burn / Early Exit Detector ────────────────────────────────────────────

export function detectBurnSignals(events: MoatEvent[]): Signal[] {
  const signals: Signal[] = [];

  const burnEvents = events.filter(
    (e) => e.eventType === "Burned" || e.eventType === "EarlyExit"
  );

  for (const event of burnEvents) {
    const amount = event.amount ?? "0";
    const formattedAmount = formatTokenAmount(amount, 18, 2);
    const userLabel = truncateAddress(event.user);
    const moatName = getMoatInfo(event.contractAddress).name;

    if (event.eventType === "EarlyExit" && event.fee) {
      const formattedFee = formatTokenAmount(event.fee, 18, 2);
      const feePercent = (
        (Number(BigInt(event.fee)) / Number(BigInt(amount))) * 100
      ).toFixed(1);

      signals.push({
        id: makeSignalId("burn", event.id),
        type: "burn",
        severity: stakeAmountSeverity(amount),
        title: `Early exit — ${feePercent}% penalty`,
        description: `${userLabel} exited ${formattedAmount} from ${moatName}, paid ${formattedFee} fee (${feePercent}%). Fewer stakers = bigger share.`,
        contractAddress: event.contractAddress,
        timestamp: event.timestamp,
        eventIds: [event.id],
        meta: { fee: event.fee, amount, user: event.user, txHash: event.txHash },
      });
    } else if (event.eventType === "Burned") {
      signals.push({
        id: makeSignalId("burn", event.id),
        type: "burn",
        severity: stakeAmountSeverity(amount),
        title: `Burn in ${moatName}`,
        description: `${userLabel} burned ${formattedAmount} from ${moatName}. Supply reduction = bigger share for remaining stakers.`,
        contractAddress: event.contractAddress,
        timestamp: event.timestamp,
        eventIds: [event.id],
        meta: { amount, user: event.user, txHash: event.txHash },
      });
    }
  }

  return signals;
}

// ─── Unstake Detector ──────────────────────────────────────────────────────

export function detectUnstakeSignals(
  events: MoatEvent[],
  topWallets?: Set<string>
): Signal[] {
  const signals: Signal[] = [];

  const unstakeEvents = events.filter((e) => e.eventType === "LockExited");

  for (const event of unstakeEvents) {
    const amount = event.amount ?? "0";
    const formattedAmount = formatTokenAmount(amount, 18, 2);
    const userLabel = truncateAddress(event.user);
    const moatName = getMoatInfo(event.contractAddress).name;
    const isTopWallet = topWallets?.has(event.user.toLowerCase()) ?? false;

    const baseSeverity = stakeAmountSeverity(amount);
    const severity: SignalSeverity = isTopWallet
      ? bumpSeverity(baseSeverity)
      : baseSeverity;

    signals.push({
      id: makeSignalId("unstake", event.id),
      type: "unstake",
      severity,
      title: isTopWallet ? `Top wallet exited ${moatName}` : `Lock exited in ${moatName}`,
      description: `${userLabel} unlocked ${formattedAmount} from ${moatName}${isTopWallet ? " (top ranked wallet)" : ""}. Watch for follow-up moves.`,
      contractAddress: event.contractAddress,
      timestamp: event.timestamp,
      eventIds: [event.id],
      meta: { amount, user: event.user, isTopWallet, txHash: event.txHash },
    });
  }

  return signals;
}

// ─── Hot Streak Detector ───────────────────────────────────────────────────
// Compares two rank snapshots. Since we poll every 60s but ranks change slowly,
// we lower the threshold to 3+ ranks to catch movement in this ecosystem.

export function detectStreakSignals(
  previous: RankSnapshot | null,
  current: MoatPointsEntry[]
): Signal[] {
  if (!previous) return [];

  // Don't fire streaks if the snapshot is less than 2 minutes old
  // (avoids noise from rapid re-polls)
  const elapsed = Date.now() - previous.timestamp.getTime();
  if (elapsed < 120_000) return [];

  const signals: Signal[] = [];

  for (const entry of current) {
    const prevEntry = previous.entries.get(entry.address.toLowerCase());
    if (!prevEntry) continue;

    const rankDelta = prevEntry.rank - entry.rank; // Positive = moved up
    const pointsDelta = entry.points - prevEntry.points;

    if (rankDelta >= 3 && pointsDelta > 0) {
      const severity: SignalSeverity =
        rankDelta >= 15 ? "critical" :
        rankDelta >= 8 ? "high" :
        rankDelta >= 5 ? "medium" : "low";

      const userLabel = entry.username !== entry.address
        ? entry.username
        : truncateAddress(entry.address);

      signals.push({
        id: makeSignalId("streak", entry.address),
        type: "streak",
        severity,
        title: `Hot streak: +${rankDelta} ranks`,
        description: `${userLabel} jumped from #${prevEntry.rank} to #${entry.rank} (+${pointsDelta.toLocaleString()} pts). Aggressive accumulation.`,
        contractAddress: "",
        timestamp: new Date(),
        eventIds: [],
        meta: {
          address: entry.address,
          previousRank: prevEntry.rank,
          currentRank: entry.rank,
          pointsDelta,
          rankDelta,
        },
      });
    }
  }

  return signals.sort((a, b) => {
    const aRank = (a.meta.rankDelta as number) ?? 0;
    const bRank = (b.meta.rankDelta as number) ?? 0;
    return bRank - aRank;
  });
}

// ─── Opportunity Score Calculator ──────────────────────────────────────────
// Now uses severity-weighted scoring instead of raw signal count.

const SEVERITY_WEIGHT: Record<SignalSeverity, number> = {
  low: 5,
  medium: 15,
  high: 35,
  critical: 50,
};

export function calculateOpportunityScore(
  rewardSignals: Signal[],
  burnSignals: Signal[],
  streakSignals: Signal[],
  unstakeSignals: Signal[],
  contractAddress: string
): {
  score: number;
  rewardVelocity: number;
  burnRate: number;
  rankVolatility: number;
  entrySignals: number;
} {
  const forContract = (signals: Signal[]) =>
    signals.filter(
      (s) => s.contractAddress === contractAddress || s.contractAddress === ""
    );

  const weightedScore = (signals: Signal[]) =>
    Math.min(100, signals.reduce((sum, s) => sum + SEVERITY_WEIGHT[s.severity], 0));

  const rewardVelocity = weightedScore(forContract(rewardSignals));
  const burnRate = weightedScore(forContract(burnSignals));
  const rankVolatility = weightedScore(forContract(streakSignals));
  const entrySignals = weightedScore(forContract(unstakeSignals));

  const score = Math.round(
    rewardVelocity * 0.4 +
      burnRate * 0.2 +
      rankVolatility * 0.2 +
      entrySignals * 0.2
  );

  return { score, rewardVelocity, burnRate, rankVolatility, entrySignals };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function severityRank(severity: SignalSeverity): number {
  const ranks: Record<SignalSeverity, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };
  return ranks[severity];
}

function bumpSeverity(severity: SignalSeverity): SignalSeverity {
  const bumps: Record<SignalSeverity, SignalSeverity> = {
    low: "medium",
    medium: "high",
    high: "critical",
    critical: "critical",
  };
  return bumps[severity];
}

/** Create a rank snapshot from current moat points data */
export function createRankSnapshot(entries: MoatPointsEntry[]): RankSnapshot {
  const map = new Map<string, { rank: number; points: number; weight: number }>();

  for (const entry of entries) {
    map.set(entry.address.toLowerCase(), {
      rank: entry.rank,
      points: entry.points,
      weight: entry.weight,
    });
  }

  return { timestamp: new Date(), entries: map };
}