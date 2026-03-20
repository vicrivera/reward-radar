import type { Signal } from "@/types";
import { SignalBadge, SeverityDot } from "@/components/shared/UIComponents";
import { timeAgo, truncateAddress, getTxUrl } from "@/utils";
import { ExternalLink } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
  index: number;
}

export function SignalCard({ signal, index }: SignalCardProps) {
  const txHash = signal.eventIds[0] ? getTxLink(signal) : null;

  return (
    <div
      className="radar-card p-4 hover:border-radar-border-bright transition-colors duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-2">
        <SignalBadge type={signal.type} />
        <SeverityDot severity={signal.severity} />
        <span className="text-xs text-radar-text-tertiary ml-auto font-mono">
          {timeAgo(signal.timestamp)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-radar-text-primary mb-1">
        {signal.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-radar-text-secondary leading-relaxed">
        {signal.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-radar-border/50">
        {signal.contractAddress && (
          <span className="text-xs font-mono text-radar-text-tertiary">
            {truncateAddress(signal.contractAddress)}
          </span>
        )}

        {txHash && (
          <a
            href={txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-radar-accent hover:text-radar-accent/80 transition-colors ml-auto"
          >
            View tx
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

function getTxLink(signal: Signal): string | null {
  // Try to extract a tx hash from event metadata
  const meta = signal.meta as Record<string, unknown>;
  if (typeof meta.txHash === "string") {
    return getTxUrl(meta.txHash);
  }
  return null;
}
