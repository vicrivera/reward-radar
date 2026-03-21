import { useMoatPoints } from "@/hooks";
import { RadarCard, Skeleton } from "@/components/shared/UIComponents";
import { truncateAddress, getAddressUrl, formatCompact } from "@/utils";
import { Trophy, ExternalLink } from "lucide-react";

export function TopStakers() {
  const { data: points, isLoading } = useMoatPoints();

  if (isLoading) {
    return (
      <RadarCard className="mt-4">
        <h2 className="text-sm font-semibold text-radar-text-primary mb-3">
          Top stakers
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </RadarCard>
    );
  }

  if (!points || points.length === 0) return null;

  const topTen = points.slice(0, 10);

  return (
    <RadarCard className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-radar-warning" />
        <h2 className="text-sm font-semibold text-radar-text-primary">
          Top stakers
        </h2>
      </div>

      <div className="space-y-1">
        {topTen.map((entry) => (
          <StakerRow key={entry.address} entry={entry} />
        ))}
      </div>
    </RadarCard>
  );
}

function StakerRow({
  entry,
}: {
  entry: { rank: number; address: string; username: string; points: number; weight: number };
}) {
  const isNamedUser = entry.username !== entry.address;
  const displayName = isNamedUser
    ? entry.username
    : truncateAddress(entry.address, 4);

  const rankColor =
    entry.rank === 1
      ? "text-radar-warning"
      : entry.rank === 2
        ? "text-radar-text-secondary"
        : entry.rank === 3
          ? "text-amber-700"
          : "text-radar-text-tertiary";

  return (
    <a
      href={getAddressUrl(entry.address)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-radar-bg/50 transition-colors group"
    >
      {/* Rank */}
      <span className={`text-[11px] font-mono w-6 text-right flex-shrink-0 ${rankColor}`}>
        #{entry.rank}
      </span>

      {/* Name */}
      <span className="text-[11px] text-radar-text-primary truncate flex-1">
        {displayName}
      </span>

      {/* Points */}
      <span className="text-[11px] font-mono text-radar-text-secondary flex-shrink-0">
        {formatCompact(entry.points)} pts
      </span>

      {/* Link indicator on hover */}
      <ExternalLink
        size={8}
        className="text-radar-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      />
    </a>
  );
}
