import { useEvents } from "@/hooks";
import { RadarCard, PulseDot } from "@/components/shared/UIComponents";
import { getMoatInfo, timeAgo, truncateAddress, getTokenInfo, formatTokenAmount } from "@/utils";
import type { MoatEvent, MoatEventType } from "@/types";

const EVENT_ICONS: Record<MoatEventType, string> = {
  RewardClaimed: "💰",
  Burned: "🔥",
  EarlyExit: "⚡",
  LockExited: "📤",
  Staked: "📥",
  Locked: "🔒",
};

const EVENT_LABELS: Record<MoatEventType, string> = {
  RewardClaimed: "Claimed",
  Burned: "Burned",
  EarlyExit: "Early exit",
  LockExited: "Unlocked",
  Staked: "Staked",
  Locked: "Locked",
};

export function ActivityPulse() {
  const { data: events, isLoading } = useEvents();

  if (isLoading || !events) return null;

  // Show last 8 events as a quick pulse view
  const recentEvents = events.slice(0, 8);

  return (
    <RadarCard className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <PulseDot />
        <h3 className="text-xs font-semibold text-radar-text-primary">
          Live activity
        </h3>
        <span className="text-[10px] text-radar-text-tertiary ml-auto">
          Last {recentEvents.length} events
        </span>
      </div>

      <div className="space-y-1">
        {recentEvents.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </RadarCard>
  );
}

function EventRow({ event }: { event: MoatEvent }) {
  const icon = EVENT_ICONS[event.eventType] ?? "📡";
  const label = EVENT_LABELS[event.eventType] ?? event.eventType;
  const moat = getMoatInfo(event.contractAddress);
  const userLabel = truncateAddress(event.user, 3);

  // Format amount if present
  let amountStr = "";
  if (event.amount && event.token) {
    const info = getTokenInfo(event.token);
    amountStr = `${formatTokenAmount(event.amount, info.decimals, 2)} ${info.symbol}`;
  } else if (event.amount) {
    amountStr = `${formatTokenAmount(event.amount, 18, 2)} tokens`;
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-radar-bg/50 transition-colors group">
      <span className="text-xs leading-none flex-shrink-0">{icon}</span>

      <span className="text-[11px] text-radar-text-secondary flex-shrink-0">
        {label}
      </span>

      {amountStr && (
        <span className="text-[11px] text-radar-text-primary font-medium truncate">
          {amountStr}
        </span>
      )}

      <span className="text-[10px] text-radar-text-tertiary truncate hidden sm:inline">
        {userLabel}
      </span>

      <span className="text-[10px] text-radar-text-tertiary ml-auto flex-shrink-0 whitespace-nowrap">
        {moat.name} · {timeAgo(event.timestamp)}
      </span>
    </div>
  );
}
