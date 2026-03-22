import { useState } from "react";
import type { Signal } from "@/types";
import { SignalBadge, SeverityDot } from "@/components/shared/UIComponents";
import {
  timeAgo,
  formatDate,
  getTxUrl,
  getAddressUrl,
  getMoatInfo,
  truncateAddress,
  getTokenInfo,
  formatTokenAmount,
} from "@/utils";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
  index: number;
}

export function SignalCard({ signal, index }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const txUrl = getTxLink(signal);

  return (
    <div
      className="radar-card overflow-hidden hover:border-radar-border-bright transition-colors duration-200 animate-slide-up"
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
    >
      {/* Main card — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        {/* Header row */}
        <div className="flex items-center gap-3 mb-2">
          <SignalBadge type={signal.type} />
          <SeverityDot severity={signal.severity} />
          <span className="text-xs text-radar-text-tertiary ml-auto font-mono">
            {timeAgo(signal.timestamp)}
          </span>
          {expanded ? (
            <ChevronUp size={12} className="text-radar-text-tertiary" />
          ) : (
            <ChevronDown size={12} className="text-radar-text-tertiary" />
          )}
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
            <span className="text-xs text-radar-text-tertiary">
              {getMoatInfo(signal.contractAddress).name}
            </span>
          )}

          {txUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-radar-accent ml-auto">
              View tx
              <ExternalLink size={10} />
            </span>
          )}
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <SignalDetail signal={signal} txUrl={txUrl} />
      )}
    </div>
  );
}

// ─── Expanded Detail ────────────────────────────────────────────────────────

function SignalDetail({
  signal,
  txUrl,
}: Readonly<{
  signal: Signal;
  txUrl: string | null;
}>) {
  const meta = signal.meta as Record<string, undefined>;
  const userAddress = String(meta.user ?? meta.address ?? "");
  const tokenAddress = typeof meta.token === "string" ? meta.token : undefined;
  const amount = typeof meta.amount === "string" ? meta.amount : undefined;
  const fee = typeof meta.fee === "string" ? meta.fee : undefined;

  return (
    <div className="px-4 pb-4 space-y-3 border-t border-radar-border/50">
      {/* Timestamp */}
      <div className="pt-3">
        <DetailRow label="Time" value={formatDate(signal.timestamp)} />
      </div>

      {/* Wallet */}
      {userAddress && (
        <DetailRow
          label="Wallet"
          value={truncateAddress(userAddress, 6)}
          href={getAddressUrl(userAddress)}
        />
      )}

      {/* Amount with token info */}
      {amount && tokenAddress && (
        <DetailRow
          label="Amount"
          value={`${formatTokenAmount(amount, getTokenInfo(tokenAddress).decimals, 4)} ${getTokenInfo(tokenAddress).symbol}`}
        />
      )}

      {amount && !tokenAddress && (
        <DetailRow
          label="Amount"
          value={`${formatTokenAmount(amount, 18, 4)} tokens`}
        />
      )}

      {/* Fee (for early exits) */}
      {fee && (
        <DetailRow
          label="Exit fee"
          value={`${formatTokenAmount(fee, 18, 4)} tokens`}
        />
      )}

      {/* Contract */}
      {signal.contractAddress && (
        <DetailRow
          label="Contract"
          value={truncateAddress(signal.contractAddress, 6)}
          href={getAddressUrl(signal.contractAddress)}
        />
      )}

      {/* Rank delta (for streaks) */}
      {meta.rankDelta && (
        <DetailRow
          label="Rank change"
          value={`#${String(meta.previousRank)} → #${String(meta.currentRank)} (+${Number(meta.pointsDelta ?? 0).toLocaleString()} pts)`}
        />
      )}

      {/* Transaction link */}
      {txUrl && (
        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 bg-radar-accent/10 border border-radar-accent/20 text-radar-accent rounded-lg text-xs font-medium hover:bg-radar-accent/20 transition-colors"
        >
          View on Snowtrace
          <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-radar-text-tertiary uppercase tracking-wider">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-radar-accent hover:underline flex items-center gap-1"
        >
          {value}
          <ExternalLink size={8} />
        </a>
      ) : (
        <span className="text-xs font-mono text-radar-text-primary">
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function getTxLink(signal: Signal): string | null {
  const meta = signal.meta as Record<string, unknown>;
  if (typeof meta.txHash === "string") {
    return getTxUrl(meta.txHash);
  }
  return null;
}