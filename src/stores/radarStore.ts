import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AlertRule,
  FeedFilter,
  Signal,
  SignalSeverity,
  TimeRange,
  RankSnapshot,
} from "@/types";

// ─── Store Interface ────────────────────────────────────────────────────────

interface RadarState {
  // User preferences
  walletAddress: string;
  feedFilter: FeedFilter;
  timeRange: TimeRange;

  // Alert config
  discordWebhookUrl: string;
  alertRules: AlertRule[];

  // Persisted signal history
  signals: Signal[];
  lastSeenEventId: string | null;

  // Persisted badge state — once earned, permanent
  earnedBadgeIds: Record<string, string>; // badge ID → ISO timestamp of when earned

  // Runtime state (not persisted)
  previousRankSnapshot: RankSnapshot | null;
  isPolling: boolean;

  // Actions
  setWalletAddress: (address: string) => void;
  setFeedFilter: (filter: FeedFilter) => void;
  setTimeRange: (range: TimeRange) => void;
  setDiscordWebhookUrl: (url: string) => void;
  addAlertRule: (rule: Omit<AlertRule, "id">) => void;
  removeAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  setSignals: (signals: Signal[]) => void;
  appendSignals: (signals: Signal[]) => void;
  clearSignals: () => void;
  earnBadge: (badgeId: string) => void;
  setPreviousRankSnapshot: (snapshot: RankSnapshot) => void;
  setLastSeenEventId: (id: string) => void;
  setIsPolling: (polling: boolean) => void;
}

// ─── Store Implementation ───────────────────────────────────────────────────

export const useRadarStore = create<RadarState>()(
  persist(
    (set) => ({
      // Defaults
      walletAddress: "",
      feedFilter: "all",
      timeRange: "24h",
      discordWebhookUrl: "",
      alertRules: [],

      // Runtime (not persisted via partialize below)
      signals: [],
      previousRankSnapshot: null,
      lastSeenEventId: null,
      earnedBadgeIds: {},
      isPolling: false,

      // Actions
      setWalletAddress: (address) => set({ walletAddress: address }),

      setFeedFilter: (filter) => set({ feedFilter: filter }),

      setTimeRange: (range) => set({ timeRange: range }),

      setDiscordWebhookUrl: (url) => set({ discordWebhookUrl: url }),

      addAlertRule: (rule) =>
        set((state) => ({
          alertRules: [
            ...state.alertRules,
            { ...rule, id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ],
        })),

      removeAlertRule: (id) =>
        set((state) => ({
          alertRules: state.alertRules.filter((r) => r.id !== id),
        })),

      toggleAlertRule: (id) =>
        set((state) => ({
          alertRules: state.alertRules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      updateAlertRule: (id, updates) =>
        set((state) => ({
          alertRules: state.alertRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      setSignals: (signals) => set({ signals }),

      appendSignals: (newSignals) =>
        set((state) => {
          const existingIds = new Set(state.signals.map((s) => s.id));
          const unique = newSignals.filter((s) => !existingIds.has(s.id));
          return { signals: [...unique, ...state.signals].slice(0, 200) };
        }),

      clearSignals: () => set({ signals: [], lastSeenEventId: null }),

      earnBadge: (badgeId) =>
        set((state) => {
          if (state.earnedBadgeIds[badgeId]) return state; // Already earned
          return {
            earnedBadgeIds: {
              ...state.earnedBadgeIds,
              [badgeId]: new Date().toISOString(),
            },
          };
        }),

      setPreviousRankSnapshot: (snapshot) =>
        set({ previousRankSnapshot: snapshot }),

      setLastSeenEventId: (id) => set({ lastSeenEventId: id }),

      setIsPolling: (polling) => set({ isPolling: polling }),
    }),
    {
      name: "reward-radar-storage",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        feedFilter: state.feedFilter,
        timeRange: state.timeRange,
        discordWebhookUrl: state.discordWebhookUrl,
        alertRules: state.alertRules,
        signals: state.signals.slice(0, 100), // Persist last 100 to keep localStorage lean
        lastSeenEventId: state.lastSeenEventId,
        earnedBadgeIds: state.earnedBadgeIds,
      }),
      // Signals contain Date objects which JSON.stringify converts to strings.
      // We rehydrate them back to Date objects on load.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.signals = state.signals.map((s) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
      },
    }
  )
);

// ─── Derived Selectors ──────────────────────────────────────────────────────

export function useFilteredSignals(): Signal[] {
  const signals = useRadarStore((s) => s.signals);
  const filter = useRadarStore((s) => s.feedFilter);
  const timeRange = useRadarStore((s) => s.timeRange);
  const walletAddress = useRadarStore((s) => s.walletAddress);

  const now = Date.now();
  const rangeMs: Record<TimeRange, number> = {
    "1h": 3600_000,
    "6h": 21600_000,
    "24h": 86400_000,
    "7d": 604800_000,
  };

  return signals.filter((signal) => {
    // Time filter
    if (now - signal.timestamp.getTime() > rangeMs[timeRange]) return false;

    // Type filter
    if (filter !== "all" && signal.type !== filter) return false;

    // Wallet filter (if set, show only signals related to that wallet)
    if (walletAddress) {
      const meta = signal.meta;
      const sigWallet =
        (meta.user as string) ?? (meta.address as string) ?? "";
      if (sigWallet && sigWallet.toLowerCase() !== walletAddress.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

/** Returns active alert rules that match a given signal */
export function getMatchingRules(
  signal: Signal,
  rules: AlertRule[]
): AlertRule[] {
  const severityOrder: Record<SignalSeverity, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };

  return rules.filter((rule) => {
    if (!rule.enabled) return false;
    if (
      rule.signalType !== "all" &&
      rule.signalType !== signal.type
    )
      return false;
    if (severityOrder[signal.severity] < severityOrder[rule.minSeverity])
      return false;
    if (
      rule.contractAddress &&
      signal.contractAddress &&
      rule.contractAddress.toLowerCase() !== signal.contractAddress.toLowerCase()
    )
      return false;
    return true;
  });
}