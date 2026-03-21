import { useMemo, useEffect } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { evaluateBadges, getAllBadges } from "@/engine";
import { RadarCard } from "@/components/shared/UIComponents";
import { timeAgo } from "@/utils";
import { Award } from "lucide-react";
import type { Badge, EarnedBadge } from "@/engine";

const TIER_STYLES: Record<string, { ring: string; bg: string; text: string }> = {
  gold: {
    ring: "ring-radar-warning/50",
    bg: "bg-radar-warning/10",
    text: "text-radar-warning",
  },
  silver: {
    ring: "ring-radar-text-secondary/30",
    bg: "bg-radar-text-secondary/10",
    text: "text-radar-text-secondary",
  },
  bronze: {
    ring: "ring-amber-700/30",
    bg: "bg-amber-700/10",
    text: "text-amber-600",
  },
};

export function BadgeShowcase() {
  const signals = useRadarStore((s) => s.signals);
  const alertRules = useRadarStore((s) => s.alertRules);
  const earnedBadgeIds = useRadarStore((s) => s.earnedBadgeIds);
  const earnBadge = useRadarStore((s) => s.earnBadge);

  // Check for newly earned badges and persist them
  const freshlyEarned = useMemo(
    () => evaluateBadges(signals, alertRules),
    [signals, alertRules]
  );

  useEffect(() => {
    for (const badge of freshlyEarned) {
      if (!earnedBadgeIds[badge.id]) {
        earnBadge(badge.id);
      }
    }
  }, [freshlyEarned, earnedBadgeIds, earnBadge]);

  // Build display list from persisted IDs (permanent) merged with fresh checks
  const allBadges = getAllBadges();

  const earned: EarnedBadge[] = allBadges
    .filter((b) => earnedBadgeIds[b.id])
    .map((b) => ({
      ...b,
      earnedAt: new Date(earnedBadgeIds[b.id]!),
    }));

  const locked = allBadges.filter((b) => !earnedBadgeIds[b.id]);

  return (
    <RadarCard>
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-radar-warning" />
        <h2 className="text-sm font-semibold text-radar-text-primary">
          Badges
        </h2>
        <span className="text-[10px] text-radar-text-tertiary ml-auto">
          {earned.length}/{allBadges.length} earned
        </span>
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {earned.map((badge) => (
            <EarnedBadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {locked.map((badge) => (
            <LockedBadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </RadarCard>
  );
}

function EarnedBadgeItem({ badge }: { badge: EarnedBadge }) {
  const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;

  return (
    <div
      className="group relative flex flex-col items-center"
      title={`${badge.name}: ${badge.description}`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${style.bg} ring-1 ${style.ring} flex items-center justify-center text-lg transition-transform group-hover:scale-110`}
      >
        {badge.icon}
      </div>
      <span className={`text-[9px] font-medium mt-1 text-center leading-tight ${style.text}`}>
        {badge.name}
      </span>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-36 p-2 bg-radar-elevated border border-radar-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <p className="text-[10px] text-radar-text-primary font-medium mb-0.5">
          {badge.name}
        </p>
        <p className="text-[9px] text-radar-text-secondary leading-relaxed">
          {badge.description}
        </p>
        <p className="text-[9px] text-radar-text-tertiary mt-1">
          Earned {timeAgo(badge.earnedAt)}
        </p>
      </div>
    </div>
  );
}

function LockedBadgeItem({ badge }: { badge: Badge }) {
  return (
    <div
      className="group relative flex flex-col items-center opacity-30"
      title={`${badge.name}: ${badge.description}`}
    >
      <div className="w-11 h-11 rounded-xl bg-radar-border/30 flex items-center justify-center text-lg grayscale">
        {badge.icon}
      </div>
      <span className="text-[9px] font-medium mt-1 text-center leading-tight text-radar-text-tertiary">
        {badge.name}
      </span>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-36 p-2 bg-radar-elevated border border-radar-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <p className="text-[10px] text-radar-text-primary font-medium mb-0.5">
          {badge.name}
        </p>
        <p className="text-[9px] text-radar-text-secondary leading-relaxed">
          {badge.description}
        </p>
        <p className="text-[9px] text-radar-text-tertiary mt-1">
          Not yet earned
        </p>
      </div>
    </div>
  );
}
