import { useParams, useSearchParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useEvents, useMoatPoints, useSignalProcessor } from "@/hooks";
import { useRadarStore } from "@/stores/radarStore";
import { SignalCard } from "@/components/feed/SignalCard";
import {
  RadarCard,
  PulseDot,
  EmptyState,
  SignalCardSkeleton,
  ScoreRing,
} from "@/components/shared/UIComponents";
import { calculateOpportunityScore } from "@/engine";
import { truncateAddress, getMoatInfo, getKnownMoatAddresses } from "@/utils";
import { Radio, ExternalLink, Copy, Check, ArrowLeft } from "lucide-react";


export function SharePage() {
  const { contractAddress } = useParams<{ contractAddress?: string }>();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  // If no contract address, show the share link generator
  if (!contractAddress) {
    return <ShareLinkGenerator />;
  }

  return <SharedMoatView contractAddress={contractAddress} isEmbed={isEmbed} />;
}

// ─── Shared Moat View ───────────────────────────────────────────────────────

function SharedMoatView({
  contractAddress,
  isEmbed,
}: Readonly<{
  contractAddress: string;
  isEmbed: boolean;
}>) {
  // Activate signal processing
  useSignalProcessor();

  const signals = useRadarStore((s) => s.signals);
  const { isLoading } = useEvents();
  useMoatPoints();

  const contractSignals = useMemo(
    () =>
      signals
        .filter(
          (s) =>
            s.contractAddress.toLowerCase() ===
            contractAddress.toLowerCase()
        )
        .slice(0, 20),
    [signals, contractAddress]
  );

  const opportunity = useMemo(() => {
    const rewardSignals = signals.filter((s) => s.type === "reward");
    const burnSignals = signals.filter((s) => s.type === "burn");
    const streakSignals = signals.filter((s) => s.type === "streak");
    const unstakeSignals = signals.filter((s) => s.type === "unstake");
    const lockSignals = signals.filter((s) => s.type === "lock");

    return calculateOpportunityScore(
      rewardSignals,
      burnSignals,
      streakSignals,
      unstakeSignals,
      lockSignals,
      contractAddress
    );
  }, [signals, contractAddress]);

  const wrapper = isEmbed ? "p-4" : "max-w-2xl mx-auto";

  return (
    <div className={wrapper}>
      {/* Header */}
      {!isEmbed && (
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-radar-text-tertiary hover:text-radar-text-secondary transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Back to feed
          </Link>
          <div className="flex items-center gap-3">
            {getMoatInfo(contractAddress).imageUrl ? (
              <img
                src={getMoatInfo(contractAddress).imageUrl}
                alt={getMoatInfo(contractAddress).name}
                className="w-10 h-10 rounded-lg object-cover bg-radar-elevated"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-radar-accent to-amber-600 flex items-center justify-center">
                <Radio size={18} className="text-radar-bg" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-display font-semibold text-radar-text-primary">
                {getMoatInfo(contractAddress).name}
              </h1>
              <p className="text-xs font-mono text-radar-text-tertiary">
                {truncateAddress(contractAddress, 8)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <PulseDot />
              <span className="text-xs text-radar-text-secondary">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Score card */}
      <RadarCard className="mb-4" glow={opportunity.score >= 70}>
        <div className="flex items-center gap-4">
          <ScoreRing score={opportunity.score} size={56} />
          <div>
            <p className="text-sm font-medium text-radar-text-primary">
              Opportunity score
            </p>
            <p className="text-xs text-radar-text-secondary mt-0.5">
              {opportunity.score >= 70
                ? "High opportunity — active rewards and movement"
                : opportunity.score >= 40
                  ? "Moderate activity — worth monitoring"
                  : "Low activity — quiet period"}
            </p>
          </div>
        </div>
      </RadarCard>

      {/* Signal feed */}
      <div className="space-y-3">
        {isLoading && (
          <>
            <SignalCardSkeleton />
            <SignalCardSkeleton />
          </>
        )}

        {!isLoading && contractSignals.length === 0 && (
          <EmptyState
            icon="📡"
            title="No signals yet"
            description="Scanning this Moat for opportunities. Signals will appear as activity is detected."
          />
        )}

        {contractSignals.map((signal, index) => (
          <SignalCard key={signal.id} signal={signal} index={index} />
        ))}
      </div>

      {/* Footer with attribution */}
      {isEmbed && (
        <div className="mt-4 pt-3 border-t border-radar-border flex items-center justify-between">
          <span className="text-[10px] text-radar-text-tertiary">
            Powered by Reward Radar
          </span>
          <a
            href={`${globalThis.location.origin}/share/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-radar-accent hover:underline"
          >
            Open full view
            <ExternalLink size={8} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Share Link Generator ───────────────────────────────────────────────────

function ShareLinkGenerator() {
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const knownMoats = getKnownMoatAddresses().map((addr) => ({
    address: addr,
    ...getMoatInfo(addr),
  }));

  const shareUrl = address
    ? `${globalThis.location.origin}/share/${address}`
    : "";
  const embedCode = address
    ? `<iframe src="${shareUrl}?embed=true" width="400" height="600" frameborder="0" style="border-radius:12px;border:1px solid #2A2B36"></iframe>`
    : "";

  const handleCopy = async (text: string, type: "link" | "embed") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-radar-text-primary">
          Share Moat alerts
        </h2>
        <p className="text-sm text-radar-text-secondary mt-1">
          Generate a shareable link or embed widget for any Moat.
        </p>
      </div>

      <RadarCard>
        {/* Quick pick known Moats */}
        <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-2">
          Select a Moat
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {knownMoats.map((moat) => (
            <button
              key={moat.address}
              onClick={() => setAddress(moat.address)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                address === moat.address
                  ? "bg-radar-accent/15 text-radar-accent border border-radar-accent/30"
                  : "bg-radar-bg border border-radar-border text-radar-text-secondary hover:text-radar-text-primary hover:border-radar-border-bright"
              }`}
            >
              {moat.name}
            </button>
          ))}
        </div>

        {/* Manual address input */}
        <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-2">
          Or enter a contract address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="w-full bg-radar-bg border border-radar-border rounded-lg px-3 py-2.5 text-sm font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none focus:border-radar-accent/50 transition-colors"
        />

        {address && (
          <div className="mt-4 space-y-4">
            {/* Share link */}
            <div>
              <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-2">
                Share link
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-radar-bg border border-radar-border rounded-lg px-3 py-2 text-xs font-mono text-radar-text-secondary truncate">
                  {shareUrl}
                </code>
                <button
                  onClick={() => handleCopy(shareUrl, "link")}
                  className="px-3 py-2 bg-radar-accent/10 border border-radar-accent/20 text-radar-accent rounded-lg text-xs hover:bg-radar-accent/20 transition-colors"
                >
                  {copied === "link" ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Embed code */}
            <div>
              <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-2">
                Embed widget
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-radar-bg border border-radar-border rounded-lg px-3 py-2 text-xs font-mono text-radar-text-secondary truncate">
                  {embedCode}
                </code>
                <button
                  onClick={() => handleCopy(embedCode, "embed")}
                  className="px-3 py-2 bg-radar-accent/10 border border-radar-accent/20 text-radar-accent rounded-lg text-xs hover:bg-radar-accent/20 transition-colors"
                >
                  {copied === "embed" ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </RadarCard>
    </div>
  );
}