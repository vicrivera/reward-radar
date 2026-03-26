// ─── Raw API Response Types ─────────────────────────────────────────────────
// These match the exact shape returned by the Moats API endpoints.

/** Event types observed in the live API */
export type MoatEventType =
  | "RewardClaimed"
  | "Burned"
  | "EarlyExit"
  | "LockExited"
  | "Staked"
  | "Locked";

/** Raw event from GET /events */
export interface RawMoatEvent {
  _id: string;
  network: string;
  contractAddress: string;
  eventType: MoatEventType;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: string; // ISO 8601
  args: Record<string, string>;
  __v: number;
}

/** Wrapper for GET /events response */
export interface EventsResponse {
  total: number;
  results: RawMoatEvent[];
}

/** Raw moat points entry from GET /moat-points/all */
export interface RawMoatPoints {
  rank: number;
  address: string;
  username: string;
  points: number;
  weight: number;
}

// ─── Normalized Domain Types ────────────────────────────────────────────────
// Cleaned and enriched versions used throughout the app.

export interface MoatEvent {
  id: string;
  contractAddress: string;
  eventType: MoatEventType;
  blockNumber: number;
  txHash: string;
  timestamp: Date;
  user: string;
  /** Parsed from args — token address for RewardClaimed */
  token?: string;
  /** Parsed from args — amount in wei as bigint string */
  amount?: string;
  /** Parsed from args — fee for EarlyExit */
  fee?: string;
  /** Parsed from args — lockIndex for lock events */
  lockIndex?: string;
}

export interface MoatPointsEntry {
  rank: number;
  address: string;
  username: string;
  points: number;
  weight: number;
}

// ─── Signal Types ───────────────────────────────────────────────────────────
// Output of the signal detection engine.

export type SignalType = "reward" | "burn" | "streak" | "unstake" | "lock";

export type SignalSeverity = "low" | "medium" | "high" | "critical";

export interface Signal {
  id: string;
  type: SignalType;
  severity: SignalSeverity;
  title: string;
  description: string;
  contractAddress: string;
  timestamp: Date;
  /** Related event IDs */
  eventIds: string[];
  /** Metadata specific to signal type */
  meta: Record<string, unknown>;
}

// ─── Opportunity Score ──────────────────────────────────────────────────────

export interface MoatOpportunity {
  contractAddress: string;
  score: number; // 0-100
  rewardVelocity: number; // 0-100
  burnRate: number; // 0-100
  rankVolatility: number; // 0-100
  entrySignals: number; // 0-100
  totalStakers: number;
  recentSignals: Signal[];
}

// ─── Alert Configuration ────────────────────────────────────────────────────

export interface AlertRule {
  id: string;
  enabled: boolean;
  signalType: SignalType | "all";
  minSeverity: SignalSeverity;
  contractAddress?: string; // undefined = all contracts
  webhookUrl: string;
}

export interface AlertConfig {
  rules: AlertRule[];
  discordWebhookUrl: string;
  lastTriggered?: Date;
}

// ─── Rank Snapshot (for hot streak detection) ───────────────────────────────

export interface RankSnapshot {
  timestamp: Date;
  entries: Map<string, { rank: number; points: number; weight: number }>;
}

// ─── UI State ───────────────────────────────────────────────────────────────

export type FeedFilter = SignalType | "all";

export type TimeRange = "1h" | "6h" | "24h" | "7d";

export interface UserPreferences {
  walletAddress?: string;
  feedFilter: FeedFilter;
  timeRange: TimeRange;
  alertConfig: AlertConfig;
}
