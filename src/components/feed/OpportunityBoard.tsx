import { useMemo } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { calculateOpportunityScore } from "@/engine";
import { RadarCard, ScoreRing, Skeleton } from "@/components/shared/UIComponents";
import { truncateAddress } from "@/utils";
import { useEvents } from "@/hooks";
import type { MoatOpportunity } from "@/types";

export function OpportunityBoard() {
  const signals = useRadarStore((s) => s.signals);
  const { isLoading } = useEvents();

  const opportunities: MoatOpportunity[] = useMemo(() => {
    // Get unique contract addresses from signals
    const contracts = new Set<string>();
    for (const signal of signals) {
      if (signal.contractAddress) {
        contracts.add(signal.contractAddress);
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
          (s) => s.contractAddress === contractAddress
        );

        return {
          contractAddress,
          ...scores,
          totalStakers: 0,
          recentSignals: contractSignals.slice(0, 5),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [signals]);

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

  if (opportunities.length === 0) {
    return (
      <RadarCard>
        <h2 className="text-sm font-semibold text-radar-text-primary mb-3">
          Opportunity board
        </h2>
        <p className="text-xs text-radar-text-tertiary text-center py-6">
          Scanning for opportunities...
        </p>
      </RadarCard>
    );
  }

  return (
    <RadarCard>
      <h2 className="text-sm font-semibold text-radar-text-primary mb-4">
        Opportunity board
      </h2>
      <div className="space-y-2">
        {opportunities.slice(0, 8).map((opp, index) => (
          <OpportunityRow key={opp.contractAddress} opportunity={opp} rank={index + 1} />
        ))}
      </div>
    </RadarCard>
  );
}

function OpportunityRow({
  opportunity,
  rank,
}: {
  opportunity: MoatOpportunity;
  rank: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-radar-bg/50 hover:bg-radar-bg transition-colors">
      {/* Rank */}
      <span className="text-xs font-mono text-radar-text-tertiary w-5 text-right">
        #{rank}
      </span>

      {/* Score ring */}
      <ScoreRing score={opportunity.score} size={40} />

      {/* Contract info */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-mono text-radar-text-primary block truncate">
          {truncateAddress(opportunity.contractAddress, 6)}
        </span>
        <span className="text-[10px] text-radar-text-tertiary">
          {opportunity.recentSignals.length} recent signal
          {opportunity.recentSignals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Score breakdown mini-bars */}
      <div className="hidden sm:flex items-center gap-1">
        <MiniBar value={opportunity.rewardVelocity} color="bg-radar-accent" label="R" />
        <MiniBar value={opportunity.burnRate} color="bg-radar-danger" label="B" />
        <MiniBar value={opportunity.rankVolatility} color="bg-radar-warning" label="V" />
        <MiniBar value={opportunity.entrySignals} color="bg-radar-info" label="E" />
      </div>
    </div>
  );
}

function MiniBar({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-4 h-8 bg-radar-border rounded-sm overflow-hidden flex flex-col justify-end">
        <div
          className={`w-full ${color} rounded-sm transition-all duration-500`}
          style={{ height: `${value}%` }}
        />
      </div>
      <span className="text-[8px] text-radar-text-tertiary font-mono">
        {label}
      </span>
    </div>
  );
}
