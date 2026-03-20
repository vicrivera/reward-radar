import { useRadarStore } from "@/stores/radarStore";
import { PulseDot } from "@/components/shared/UIComponents";
import type { FeedFilter, TimeRange } from "@/types";

const FILTER_OPTIONS: { value: FeedFilter; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "📡" },
  { value: "reward", label: "Rewards", icon: "💰" },
  { value: "burn", label: "Burns", icon: "🔥" },
  { value: "streak", label: "Streaks", icon: "🚀" },
  { value: "unstake", label: "Unstakes", icon: "📤" },
];

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1h", label: "1H" },
  { value: "6h", label: "6H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
];

export function FeedFilters({ signalCount }: { signalCount: number }) {
  const feedFilter = useRadarStore((s) => s.feedFilter);
  const setFeedFilter = useRadarStore((s) => s.setFeedFilter);
  const timeRange = useRadarStore((s) => s.timeRange);
  const setTimeRange = useRadarStore((s) => s.setTimeRange);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Signal type filters */}
      <div className="flex items-center gap-1 bg-radar-surface border border-radar-border rounded-lg p-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFeedFilter(option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              feedFilter === option.value
                ? "bg-radar-elevated text-radar-text-primary shadow-sm"
                : "text-radar-text-secondary hover:text-radar-text-primary"
            }`}
          >
            <span className="text-sm leading-none">{option.icon}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Time range */}
      <div className="flex items-center gap-1 bg-radar-surface border border-radar-border rounded-lg p-1">
        {TIME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              timeRange === option.value
                ? "bg-radar-elevated text-radar-text-primary shadow-sm"
                : "text-radar-text-secondary hover:text-radar-text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Live indicator + count */}
      <div className="flex items-center gap-2 ml-auto">
        <PulseDot />
        <span className="text-xs text-radar-text-secondary font-mono">
          {signalCount} signal{signalCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
