import type { EventsResponse, RawMoatEvent, RawMoatPoints, MoatEvent } from "@/types";

const BASE_URL = "https://moat-api.fortifi.network/api";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 500;

// ─── Internal Helpers ───────────────────────────────────────────────────────

async function fetchWithRetry<T>(url: string): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES - 1) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError ?? new Error("Request failed after retries");
}

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeEvent(raw: RawMoatEvent): MoatEvent {
  return {
    id: raw._id,
    contractAddress: raw.contractAddress,
    eventType: raw.eventType,
    blockNumber: raw.blockNumber,
    txHash: raw.transactionHash,
    timestamp: new Date(raw.timestamp),
    user: raw.args.user ?? "",
    token: raw.args.token,
    amount: raw.args.amount,
    fee: raw.args.fee,
    lockIndex: raw.args.lockIndex,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Fetch all events, returns normalized and sorted by timestamp desc */
export async function fetchEvents(): Promise<MoatEvent[]> {
  const data = await fetchWithRetry<EventsResponse>(`${BASE_URL}/events`);

  return data.results
    .map(normalizeEvent)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/** Fetch all moat points across all Moats */
export async function fetchAllMoatPoints(): Promise<RawMoatPoints[]> {
  return fetchWithRetry<RawMoatPoints[]>(`${BASE_URL}/moat-points/all`);
}

/** Fetch moat points for a specific contract address */
export async function fetchMoatPoints(contractAddress: string): Promise<RawMoatPoints[]> {
  if (!isValidAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const encoded = encodeURIComponent(contractAddress);
  return fetchWithRetry<RawMoatPoints[]>(
    `${BASE_URL}/moat-points/all?contractAddress=${encoded}`
  );
}

// ─── Validators ─────────────────────────────────────────────────────────────

/** Validates an Ethereum-style 0x address */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
