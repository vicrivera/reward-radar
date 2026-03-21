import { useMoatPoints } from "@/hooks";
import { truncateAddress, formatCompact, getAddressUrl } from "@/utils";
import { Trophy } from "lucide-react";

export function StakerMarquee() {
  const { data: points, isLoading } = useMoatPoints();

  if (isLoading || !points || points.length === 0) return null;

  const topStakers = points.slice(0, 10);

  return (
    <div className="bg-radar-surface/40 border-b border-radar-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-9">
          {/* Label */}
          <div className="flex items-center gap-1.5 pr-4 border-r border-radar-border/50 flex-shrink-0 z-10 bg-radar-surface/40">
            <Trophy size={11} className="text-radar-accent" />
            <span className="text-[10px] text-radar-text-tertiary uppercase tracking-wider whitespace-nowrap">
              Top 10 stakers
            </span>
          </div>

          {/* Scrolling track */}
          <div className="overflow-hidden flex-1 ml-4 marquee-mask">
            <div className="animate-marquee flex w-max">
              {/* First copy */}
              <StakerList stakers={topStakers} keyPrefix="a" />
              {/* Second copy — identical, creates the seamless loop */}
              <StakerList stakers={topStakers} keyPrefix="b" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StakerList({
  stakers,
  keyPrefix,
}: {
  stakers: Array<{ rank: number; address: string; username: string; points: number }>;
  keyPrefix: string;
}) {
  return (
    <div className="flex items-center gap-6 pr-6 flex-shrink-0">
      {stakers.map((entry) => {
        const isNamedUser = entry.username !== entry.address;
        const displayName = isNamedUser
          ? entry.username
          : truncateAddress(entry.address, 3);

        const rankColor =
          entry.rank === 1
            ? "text-radar-accent"
            : entry.rank <= 3
              ? "text-radar-text-primary"
              : "text-radar-text-secondary";

        return (
          <a
            key={`${keyPrefix}-${entry.address}`}
            href={getAddressUrl(entry.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <span className={`text-[10px] font-mono ${rankColor}`}>
              #{entry.rank}
            </span>
            <span className="text-[11px] text-radar-text-primary">
              {displayName}
            </span>
            <span className="text-[10px] font-mono text-radar-text-tertiary">
              {formatCompact(entry.points)}
            </span>
          </a>
        );
      })}
    </div>
  );
}
