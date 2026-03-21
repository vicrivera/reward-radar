import { useMemo } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { useEvents, useMoatPoints } from "@/hooks";
import { getKnownMoatAddresses } from "@/utils";
import { Activity, Radio, TrendingUp, Zap } from "lucide-react";

export function StatsHeader() {
  const signals = useRadarStore((s) => s.signals);
  const { data: events } = useEvents();
  const { data: points } = useMoatPoints();

  const stats = useMemo(() => {
    const now = Date.now();
    const last24h = signals.filter(
      (s) => now - s.timestamp.getTime() < 86_400_000
    );

    const highSeverity = last24h.filter(
      (s) => s.severity === "high" || s.severity === "critical"
    );

    // Count unique contracts with activity
    const activeContracts = new Set<string>();
    for (const signal of last24h) {
      if (signal.contractAddress) {
        activeContracts.add(signal.contractAddress.toLowerCase());
      }
    }

    // Best opportunity score
    const knownMoats = getKnownMoatAddresses();
    const activeMoatCount = Math.max(activeContracts.size, knownMoats.length);

    return {
      totalSignals: last24h.length,
      hotSignals: highSeverity.length,
      activeMoats: activeMoatCount,
      totalEvents: events?.length ?? 0,
      totalStakers: points?.length ?? 0,
    };
  }, [signals, events, points]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={<Zap size={14} />}
        label="Signals (24h)"
        value={stats.totalSignals}
        accent={stats.hotSignals > 0 ? "text-radar-accent" : undefined}
        sub={stats.hotSignals > 0 ? `${stats.hotSignals} hot` : undefined}
      />
      <StatCard
        icon={<Radio size={14} />}
        label="Active Moats"
        value={stats.activeMoats}
      />
      <StatCard
        icon={<Activity size={14} />}
        label="Events tracked"
        value={stats.totalEvents}
      />
      <StatCard
        icon={<TrendingUp size={14} />}
        label="Stakers"
        value={stats.totalStakers}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="radar-card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-radar-text-tertiary">{icon}</span>
        <span className="text-[10px] text-radar-text-tertiary uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-xl font-display font-semibold ${accent ?? "text-radar-text-primary"}`}
        >
          {value.toLocaleString()}
        </span>
        {sub && (
          <span className="text-[10px] text-radar-warning font-medium">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
