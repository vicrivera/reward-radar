import { useFilteredSignals } from "@/stores/radarStore";
import { useSignalProcessor } from "@/hooks";
import { SignalCard } from "./SignalCard";
import { FeedFilters } from "./FeedFilters";
import {
  EmptyState,
  SignalCardSkeleton,
} from "@/components/shared/UIComponents";
import { useEvents, useMoatPoints } from "@/hooks";

export function SignalFeed() {
  // Activate signal processing
  useSignalProcessor();

  const filteredSignals = useFilteredSignals();
  const { isLoading: eventsLoading, isError: eventsError } = useEvents();
  const { isLoading: pointsLoading } = useMoatPoints();

  const isLoading = eventsLoading || pointsLoading;

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <FeedFilters signalCount={filteredSignals.length} />

      {/* Feed content */}
      <div className="space-y-3">
        {isLoading && (
          <>
            <SignalCardSkeleton />
            <SignalCardSkeleton />
            <SignalCardSkeleton />
          </>
        )}

        {eventsError && (
          <div className="radar-card p-6 text-center">
            <p className="text-radar-danger text-sm font-medium mb-1">
              Failed to connect to Moats API
            </p>
            <p className="text-radar-text-tertiary text-xs">
              Retrying automatically...
            </p>
          </div>
        )}

        {!isLoading && !eventsError && filteredSignals.length === 0 && (
          <EmptyState
            icon="📡"
            title="No signals detected"
            description="The radar is scanning. Signals will appear here as new opportunities are detected in the Moats ecosystem."
          />
        )}

        {filteredSignals.map((signal, index) => (
          <SignalCard key={signal.id} signal={signal} index={index} />
        ))}
      </div>
    </div>
  );
}
