import { useMemo, useState } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { calculateOpportunityScore } from "@/engine";
import {
  RadarCard,
  ScoreRing,
  Skeleton,
  SignalBadge,
  SeverityDot,
} from "@/components/shared/UIComponents";
import { getMoatInfo, getKnownMoatAddresses, timeAgo, truncateAddress } from "@/utils";
import { useEvents, useMoatPoints } from "@/hooks";
import { ChevronDown, ChevronUp, Users, ExternalLink } from "lucide-react";
import type { MoatOpportunity, Signal } from "@/types";

export function OpportunityBoard() {
  const signals = useRadarStore((s) => s.signals);
  const { isLoading: eventsLoading } = useEvents();
  const { data: pointsData, isLoading: pointsLoading } = useMoatPoints();

  const isLoading = eventsLoading || pointsLoading;

  const opportunities: MoatOpportunity[] = useMemo(() => {
    // Start with all known Moat addresses
    const contracts = new Set(getKnownMoatAddresses());

    // Also add any contracts we've seen in signals (catches new/unknown Moats)
    for (const signal of signals) {
      if (signal.contractAddress) {
        contracts.add(signal.contractAddress.toLowerCase());
      }
    }

    const rewardSignals = signals.filter((s) => s.type === "reward");
    const burnSignals = signals.filter((s) => s.type === "burn");
    const streakSignals = signals.filter((s) => s.type === "streak");
    const unstakeSignals = signals.filter((s) => s.type === "unstake");
    const lockSignals = signals.filter((s) => s.type === "lock");

    return Array.from(contracts)
      .map((contractAddress) => {
        const scores = calculateOpportunityScore(
            rewardSignals,
            burnSignals,
            streakSignals,
            unstakeSignals,
            lockSignals,       // add this
            contractAddress
        );

        const contractSignals = signals
          .filter(
            (s) =>
              s.contractAddress.toLowerCase() === contractAddress.toLowerCase()
          )
          .slice(0, 5);

        // Count unique stakers from points data that have interacted with this contract
        // (Since moat-points/all is global, we show total ecosystem stakers as context)
        const totalStakers = pointsData?.length ?? 0;

        return {
          contractAddress,
          ...scores,
          totalStakers,
          recentSignals: contractSignals,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [signals, pointsData]);

  if (isLoading) {
    return (
      <RadarCard className="space-y-4">
        <h2 className="text-sm font-semibold text-radar-text-primary">
          Opportunity board
        </h2>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </RadarCard>
    );
  }

  return (
    <RadarCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-radar-text-primary">
          Opportunity board
        </h2>
        {pointsData && (
          <div className="flex items-center gap-1 text-[10px] text-radar-text-tertiary">
            <Users size={10} />
            {pointsData.length} stakers
          </div>
        )}
      </div>

      {opportunities.length === 0 ? (
        <p className="text-xs text-radar-text-tertiary text-center py-6">
          Scanning for opportunities...
        </p>
      ) : (
        <div className="space-y-2">
          {opportunities.map((opp, index) => (
            <OpportunityRow
              key={opp.contractAddress}
              opportunity={opp}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </RadarCard>
  );
}

// ─── Opportunity Row (expandable) ───────────────────────────────────────────

function OpportunityRow({
  opportunity,
  rank,
}: {
  opportunity: MoatOpportunity;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const moatInfo = getMoatInfo(opportunity.contractAddress);

  return (
    <div
      className="rounded-lg bg-radar-bg/50 overflow-hidden transition-colors"
      style={moatInfo.accentColor ? { borderLeft: `3px solid ${moatInfo.accentColor}33` } : undefined}
    >
      {/* Main row — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 p-2.5 w-full text-left hover:bg-radar-bg/80 transition-colors"
      >
        {/* Rank */}
        <span className="text-[10px] font-mono text-radar-text-tertiary w-5 text-right flex-shrink-0">
          #{rank}
        </span>

        {/* Moat image */}
        {moatInfo.imageUrl && (
          <img
            src={moatInfo.imageUrl}
            alt={moatInfo.name}
            className="w-7 h-7 rounded-md object-cover flex-shrink-0 bg-radar-elevated"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Score ring */}
        <ScoreRing score={opportunity.score} size={34} />

        {/* Moat info */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-radar-text-primary block truncate">
            {moatInfo.name}
          </span>
          <span className="text-[10px] text-radar-text-tertiary">
            {opportunity.recentSignals.length > 0
              ? `${opportunity.recentSignals.length} signal${opportunity.recentSignals.length !== 1 ? "s" : ""}`
              : "Quiet"}
          </span>
        </div>

        {expanded ? (
          <ChevronUp size={12} className="text-radar-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronDown size={12} className="text-radar-text-tertiary flex-shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <MoatDetail opportunity={opportunity} />
      )}
    </div>
  );
}

// ─── Moat Detail Panel ──────────────────────────────────────────────────────

function MoatDetail({
  opportunity,
}: {
  opportunity: MoatOpportunity;
}) {
  return (
    <div className="px-3 pb-3 space-y-3 border-t border-radar-border/50">
      {/* Score breakdown */}
      <div className="grid grid-cols-4 gap-2 pt-3">
        <ScoreBreakdownItem
          label="Rewards"
          value={opportunity.rewardVelocity}
          color="text-radar-accent"
        />
        <ScoreBreakdownItem
          label="Burns"
          value={opportunity.burnRate}
          color="text-radar-danger"
        />
        <ScoreBreakdownItem
          label="Volatility"
          value={opportunity.rankVolatility}
          color="text-radar-warning"
        />
        <ScoreBreakdownItem
          label="Entries"
          value={opportunity.entrySignals}
          color="text-radar-info"
        />
      </div>

      {/* Recent signals for this Moat */}
      {opportunity.recentSignals.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] text-radar-text-tertiary uppercase tracking-wider">
            Recent signals
          </span>
          {opportunity.recentSignals.map((signal) => (
            <MiniSignalRow key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-radar-text-tertiary py-2">
          No recent signals — this Moat is quiet. Could be a good time to position.
        </p>
      )}

      {/* Contract address + links */}
      <div className="flex items-center gap-2 pt-1">
        <code className="text-[10px] font-mono text-radar-text-tertiary">
          {truncateAddress(opportunity.contractAddress, 8)}
        </code>
        <a
          href={`/share/${opportunity.contractAddress}`}
          className="flex items-center gap-1 text-[10px] text-radar-accent hover:underline ml-auto"
        >
          Share alerts
          <ExternalLink size={8} />
        </a>
      </div>
    </div>
  );
}

function ScoreBreakdownItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <span className={`text-sm font-mono font-medium ${color}`}>{value}</span>
      <span className="text-[9px] text-radar-text-tertiary block mt-0.5">
        {label}
      </span>
    </div>
  );
}

function MiniSignalRow({ signal }: { signal: Signal }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <SeverityDot severity={signal.severity} />
      <SignalBadge type={signal.type} />
      <span className="text-[11px] text-radar-text-secondary truncate flex-1">
        {signal.title}
      </span>
      <span className="text-[10px] text-radar-text-tertiary font-mono flex-shrink-0">
        {timeAgo(signal.timestamp)}
      </span>
    </div>
  );
}