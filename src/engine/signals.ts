import type {
  MoatEvent,
  MoatPointsEntry,
  Signal,
  SignalSeverity,
  RankSnapshot,
} from "@/types";
import { formatTokenAmount, getTokenInfo, truncateAddress } from "@/utils";

// ─── Signal ID Generator ────────────────────────────────────────────────────

let signalCounter = 0;

function makeSignalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++signalCounter}`;
}

// ─── Severity Thresholds ────────────────────────────────────────────────────

function amountSeverity(weiAmount: string, decimals: number): SignalSeverity {
  const value = Number(BigInt(weiAmount)) / 10 ** decimals;

  if (value > 10_000) return "critical";
  if (value > 1_000) return "high";
  if (value > 100) return "medium";
  return "low";
}

// ─── Reward Drop Detector ───────────────────────────────────────────────────
// Groups RewardClaimed events by contract within a time window.
// Flags contracts with high reward activity as opportunities.

export function detectRewardSignals(
  events: MoatEvent[],
  windowMs: number = 3600_000 // 1 hour
): Signal[] {
  const now = Date.now();
  const rewardEvents = events.filter(
    (e) => e.eventType === "RewardClaimed" && now - e.timestamp.getTime() < windowMs
  );

  // Group by contract address
  const byContract = new Map<string, MoatEvent[]>();
  for (const event of rewardEvents) {
    const existing = byContract.get(event.contractAddress) ?? [];
    existing.push(event);
    byContract.set(event.contractAddress, existing);
  }

  const signals: Signal[] = [];

  for (const [contractAddress, contractEvents] of byContract) {
    if (contractEvents.length < 2) continue; // Need multiple claims to be interesting

    // Find the highest-value claim for severity
    let maxSeverity: SignalSeverity = "low";
    const tokenClaims = new Map<string, bigint>();

    for (const event of contractEvents) {
      if (event.token && event.amount) {
        const current = tokenClaims.get(event.token) ?? 0n;
        tokenClaims.set(event.token, current + BigInt(event.amount));

        const info = getTokenInfo(event.token);
        const sev = amountSeverity(event.amount, info.decimals);
        if (severityRank(sev) > severityRank(maxSeverity)) {
          maxSeverity = sev;
        }
      }
    }

    // Build description from aggregated claims
    const claimSummaries = Array.from(tokenClaims.entries()).map(
      ([tokenAddr, total]) => {
        const info = getTokenInfo(tokenAddr);
        return `${formatTokenAmount(total.toString(), info.decimals, 2)} ${info.symbol}`;
      }
    );

    signals.push({
      id: makeSignalId("reward"),
      type: "reward",
      severity: maxSeverity,
      title: `Reward activity spike`,
      description: `${contractEvents.length} claims in the last hour: ${claimSummaries.join(", ")}`,
      contractAddress,
      timestamp: contractEvents[0]!.timestamp,
      eventIds: contractEvents.map((e) => e.id),
      meta: {
        claimCount: contractEvents.length,
        tokenClaims: Object.fromEntries(
          Array.from(tokenClaims.entries()).map(([k, v]) => [k, v.toString()])
        ),
      },
    });
  }

  return signals;
}

// ─── Burn / Early Exit Detector ─────────────────────────────────────────────
// Watches for Burned and EarlyExit events. Large fees on early exits
// signal conviction shifts — potential entry opportunities for others.

export function detectBurnSignals(events: MoatEvent[]): Signal[] {
  const signals: Signal[] = [];

  const burnEvents = events.filter(
    (e) => e.eventType === "Burned" || e.eventType === "EarlyExit"
  );

  for (const event of burnEvents) {
    const amount = event.amount ?? "0";
    const info = { symbol: "tokens", decimals: 18 }; // Burns use native token
    const formattedAmount = formatTokenAmount(amount, info.decimals, 2);
    const userLabel = truncateAddress(event.user);

    if (event.eventType === "EarlyExit" && event.fee) {
      const formattedFee = formatTokenAmount(event.fee, 18, 2);

      signals.push({
        id: makeSignalId("burn"),
        type: "burn",
        severity: amountSeverity(amount, 18),
        title: `Early exit with penalty`,
        description: `${userLabel} exited ${formattedAmount} tokens, paid ${formattedFee} fee. Fewer stakers = bigger share for remaining.`,
        contractAddress: event.contractAddress,
        timestamp: event.timestamp,
        eventIds: [event.id],
        meta: { fee: event.fee, amount, user: event.user },
      });
    } else if (event.eventType === "Burned") {
      signals.push({
        id: makeSignalId("burn"),
        type: "burn",
        severity: amountSeverity(amount, 18),
        title: `Token burn detected`,
        description: `${userLabel} burned ${formattedAmount} tokens. Supply reduction in this Moat.`,
        contractAddress: event.contractAddress,
        timestamp: event.timestamp,
        eventIds: [event.id],
        meta: { amount, user: event.user },
      });
    }
  }

  return signals;
}

// ─── Unstake Detector ───────────────────────────────────────────────────────
// LockExited events with large amounts signal capital leaving a Moat.

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
    const isTopWallet = topWallets?.has(event.user.toLowerCase());

    const baseSeverity = amountSeverity(amount, 18);
    // Bump severity if it's a top wallet
    const severity: SignalSeverity = isTopWallet
      ? bumpSeverity(baseSeverity)
      : baseSeverity;

    signals.push({
      id: makeSignalId("unstake"),
      type: "unstake",
      severity,
      title: isTopWallet ? `Top wallet unstaked` : `Lock exited`,
      description: `${userLabel} unlocked ${formattedAmount} tokens${isTopWallet ? " (top ranked wallet)" : ""}. Watch for follow-up moves.`,
      contractAddress: event.contractAddress,
      timestamp: event.timestamp,
      eventIds: [event.id],
      meta: { amount, user: event.user, isTopWallet },
    });
  }

  return signals;
}

// ─── Hot Streak Detector ────────────────────────────────────────────────────
// Compares two rank snapshots to find wallets that jumped 5+ positions.

export function detectStreakSignals(
  previous: RankSnapshot | null,
  current: MoatPointsEntry[]
): Signal[] {
  if (!previous) return [];

  const signals: Signal[] = [];

  for (const entry of current) {
    const prevEntry = previous.entries.get(entry.address.toLowerCase());
    if (!prevEntry) continue;

    const rankDelta = prevEntry.rank - entry.rank; // Positive = moved up
    const pointsDelta = entry.points - prevEntry.points;

    if (rankDelta >= 5 && pointsDelta > 0) {
      const severity: SignalSeverity =
        rankDelta >= 20 ? "critical" : rankDelta >= 10 ? "high" : "medium";

      const userLabel = entry.username !== entry.address
        ? entry.username
        : truncateAddress(entry.address);

      signals.push({
        id: makeSignalId("streak"),
        type: "streak",
        severity,
        title: `Hot streak: +${rankDelta} ranks`,
        description: `${userLabel} jumped from #${prevEntry.rank} to #${entry.rank} (+${pointsDelta.toLocaleString()} pts). Aggressive accumulation.`,
        contractAddress: "", // Global signal, not contract-specific
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

// ─── Opportunity Score Calculator ───────────────────────────────────────────

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

  // Normalize each component 0-100
  const rewardVelocity = Math.min(
    100,
    forContract(rewardSignals).length * 25
  );
  const burnRate = Math.min(100, forContract(burnSignals).length * 30);
  const rankVolatility = Math.min(
    100,
    forContract(streakSignals).length * 20
  );
  const entrySignals = Math.min(
    100,
    forContract(unstakeSignals).length * 35
  );

  const score = Math.round(
    rewardVelocity * 0.4 +
      burnRate * 0.2 +
      rankVolatility * 0.2 +
      entrySignals * 0.2
  );

  return { score, rewardVelocity, burnRate, rankVolatility, entrySignals };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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
