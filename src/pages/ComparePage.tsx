import { useMemo } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { useEvents, useMoatPoints, useSignalProcessor } from "@/hooks";
import { calculateOpportunityScore } from "@/engine";
import {
  RadarCard,
  ScoreRing,
  Skeleton,
  PulseDot,
} from "@/components/shared/UIComponents";
import {
  getMoatInfo,
  getKnownMoatAddresses,
  truncateAddress,
  getAddressUrl,
} from "@/utils";
import { ExternalLink, ArrowUpRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { MoatOpportunity, SignalType } from "@/types";

const SCORE_BAR_COLORS: Record<string, string> = {
  rewardVelocity: "bg-radar-accent",
  burnRate: "bg-radar-danger",
  rankVolatility: "bg-radar-warning",
  entrySignals: "bg-radar-info",
};

const SCORE_LABELS: Record<string, string> = {
  rewardVelocity: "Rewards",
  burnRate: "Burns",
  rankVolatility: "Volatility",
  entrySignals: "Entry signals",
};

export function ComparePage() {
  useSignalProcessor();

  const signals = useRadarStore((s) => s.signals);
  const { isLoading: eventsLoading } = useEvents();
  const { data: pointsData, isLoading: pointsLoading } = useMoatPoints();

  const isLoading = eventsLoading || pointsLoading;

  const moats: MoatOpportunity[] = useMemo(() => {
    const contracts = new Set(getKnownMoatAddresses());
    for (const signal of signals) {
      if (signal.contractAddress) {
        contracts.add(signal.contractAddress.toLowerCase());
      }
    }

    const rewardSignals = signals.filter((s) => s.type === "reward");
    const burnSignals = signals.filter((s) => s.type === "burn");
    const streakSignals = signals.filter((s) => s.type === "streak");
    const unstakeSignals = signals.filter((s) => s.type === "unstake");

    return Array.from(contracts)
      .map((contractAddress) => {
        const scores = calculateOpportunityScore(
          rewardSignals,
          burnSignals,
          streakSignals,
          unstakeSignals,
          contractAddress
        );

        const contractSignals = signals.filter(
          (s) =>
            s.contractAddress.toLowerCase() === contractAddress.toLowerCase()
        );

        return {
          contractAddress,
          ...scores,
          totalStakers: pointsData?.length ?? 0,
          recentSignals: contractSignals.slice(0, 5),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [signals, pointsData]);

  const signalCounts = useMemo(() => {
    const counts: Record<SignalType, number> = {
      reward: 0,
      burn: 0,
      streak: 0,
      unstake: 0,
      lock: 0,
    };
    for (const signal of signals) {
      counts[signal.type]++;
    }
    return counts;
  }, [signals]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-display font-semibold text-radar-text-primary">
            Cross-Moat comparison
          </h2>
          <PulseDot />
        </div>
        <p className="text-sm text-radar-text-secondary">
          Side-by-side breakdown of all Moats — find where to stake next.
        </p>
      </div>

      {/* Ecosystem summary */}
      <RadarCard className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <SummaryChip label="Total signals" value={signals.length} />
          <SummaryChip label="Rewards" value={signalCounts.reward} color="text-radar-accent" />
          <SummaryChip label="Burns" value={signalCounts.burn} color="text-radar-danger" />
          <SummaryChip label="Streaks" value={signalCounts.streak} color="text-radar-warning" />
          <SummaryChip label="Unstakes" value={signalCounts.unstake} color="text-radar-info" />
          <SummaryChip label="Stakers" value={pointsData?.length ?? 0} />
        </div>
      </RadarCard>

      {/* Moat cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RadarCard key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-full" />
            </RadarCard>
          ))}
        </div>
      ) : moats.length === 0 ? (
        <RadarCard className="text-center py-12">
          <p className="text-radar-text-tertiary text-sm">
            No Moats detected yet. Signals will populate as the radar scans.
          </p>
        </RadarCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {moats.map((moat, index) => (
            <MoatCompareCard key={moat.contractAddress} moat={moat} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Moat Comparison Card ───────────────────────────────────────────────────

function MoatCompareCard({
  moat,
  rank,
}: {
  moat: MoatOpportunity;
  rank: number;
}) {
  const info = getMoatInfo(moat.contractAddress);

  const scoreFields = [
    { key: "rewardVelocity", value: moat.rewardVelocity },
    { key: "burnRate", value: moat.burnRate },
    { key: "rankVolatility", value: moat.rankVolatility },
    { key: "entrySignals", value: moat.entrySignals },
  ];

  const verdict =
    moat.score >= 70
      ? "Hot opportunity"
      : moat.score >= 40
        ? "Active — worth watching"
        : moat.score > 0
          ? "Quiet — potential entry"
          : "No activity detected";

  const verdictColor =
    moat.score >= 70
      ? "text-radar-accent"
      : moat.score >= 40
        ? "text-radar-warning"
        : "text-radar-text-tertiary";

  return (
    <RadarCard
      className="flex flex-col"
      glow={moat.score >= 70}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {info.imageUrl ? (
          <img
            src={info.imageUrl}
            alt={info.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-radar-elevated"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ScoreRing score={moat.score} size={52} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-radar-text-tertiary">
              #{rank}
            </span>
            <h3 className="text-sm font-semibold text-radar-text-primary truncate">
              {info.name}
            </h3>
            {info.imageUrl && <ScoreRing score={moat.score} size={28} />}
          </div>
          {info.description && (
            <p className="text-[11px] text-radar-text-tertiary mt-0.5">
              {info.description}
            </p>
          )}
          <p className={`text-[11px] font-medium mt-1 ${verdictColor}`}>
            {verdict}
          </p>
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="space-y-2 mb-4 flex-1">
        {scoreFields.map(({ key, value }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-radar-text-tertiary">
                {SCORE_LABELS[key]}
              </span>
              <span className="text-[10px] font-mono text-radar-text-secondary">
                {value}
              </span>
            </div>
            <div className="h-1.5 bg-radar-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${SCORE_BAR_COLORS[key]}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Signal count */}
      <div className="flex items-center gap-3 py-3 border-t border-radar-border/50 text-[11px] text-radar-text-secondary">
        <span>
          {moat.recentSignals.length} signal{moat.recentSignals.length !== 1 ? "s" : ""}
        </span>
        <span className="text-radar-text-tertiary">·</span>
        <code className="text-[10px] font-mono text-radar-text-tertiary truncate flex-1">
          {truncateAddress(moat.contractAddress, 6)}
        </code>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <a
          href={getAddressUrl(moat.contractAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-radar-text-secondary hover:text-radar-text-primary bg-radar-bg rounded-md transition-colors"
        >
          Snowtrace
          <ExternalLink size={8} />
        </a>
        <Link
          to={`/share/${moat.contractAddress}`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-radar-text-secondary hover:text-radar-text-primary bg-radar-bg rounded-md transition-colors"
        >
          Alerts page
          <ArrowUpRight size={8} />
        </Link>
        <Link
          to="/share"
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-radar-accent hover:bg-radar-accent/10 rounded-md transition-colors ml-auto"
        >
          <Share2 size={8} />
          Share
        </Link>
      </div>
    </RadarCard>
  );
}

function SummaryChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-display font-semibold ${color ?? "text-radar-text-primary"}`}>
        {value.toLocaleString()}
      </span>
      <span className="text-[10px] text-radar-text-tertiary uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
