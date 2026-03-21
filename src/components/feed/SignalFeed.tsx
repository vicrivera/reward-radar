import { useState, useMemo } from "react";
import { useFilteredSignals } from "@/stores/radarStore";
import { useSignalProcessor } from "@/hooks";
import { SignalCard } from "./SignalCard";
import { FeedFilters } from "./FeedFilters";
import {
  EmptyState,
  SignalCardSkeleton,
  PulseDot,
} from "@/components/shared/UIComponents";
import { useEvents, useMoatPoints } from "@/hooks";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

export function SignalFeed() {
  useSignalProcessor();

  const filteredSignals = useFilteredSignals();
  const { isLoading: eventsLoading, isError: eventsError } = useEvents();
  const { isLoading: pointsLoading } = useMoatPoints();
  const [page, setPage] = useState(0);

  const isLoading = eventsLoading || pointsLoading;

  const totalPages = Math.max(1, Math.ceil(filteredSignals.length / PAGE_SIZE));

  // Reset to first page when filters change and current page is out of bounds
  const safePage = Math.min(page, totalPages - 1);
  if (safePage !== page) setPage(safePage);

  const pageSignals = useMemo(
    () => filteredSignals.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filteredSignals, safePage]
  );

  return (
    <div className="space-y-4">
      {/* Section title with count */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-display font-semibold text-radar-text-primary">
          Live Activity
        </h2>
        <PulseDot />
        <span className="text-xs text-radar-text-tertiary font-mono">
          {filteredSignals.length} signal{filteredSignals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters bar */}
      <FeedFilters />

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

        {pageSignals.map((signal, index) => (
          <SignalCard key={signal.id} signal={signal} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {filteredSignals.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-radar-text-secondary hover:text-radar-text-primary hover:bg-radar-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <span className="text-xs font-mono text-radar-text-tertiary">
            {safePage + 1} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-radar-text-secondary hover:text-radar-text-primary hover:bg-radar-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}