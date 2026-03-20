// ─── Address Formatting ─────────────────────────────────────────────────────

/** Truncates an address to 0x1234...5678 format */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ─── Amount Formatting ──────────────────────────────────────────────────────

/**
 * Converts a wei-string to a human-readable token amount.
 * Handles common ERC-20 decimals: 18 (WAVAX, most tokens), 6 (USDC), 8 (WBTC).
 */
export function formatTokenAmount(
  weiAmount: string,
  decimals = 18,
  maxDisplayDecimals = 4
): string {
  if (!weiAmount || weiAmount === "0") return "0";

  const raw = BigInt(weiAmount);
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;

  if (remainder === 0n) {
    return formatWithCommas(whole.toString());
  }

  const remainderStr = remainder.toString().padStart(decimals, "0");
  const trimmed = remainderStr.slice(0, maxDisplayDecimals).replace(/0+$/, "");

  if (!trimmed) {
    return formatWithCommas(whole.toString());
  }

  return `${formatWithCommas(whole.toString())}.${trimmed}`;
}

/** Adds thousands separators */
function formatWithCommas(numStr: string): string {
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Formats a large number compactly: 1.2K, 3.4M, etc. */
export function formatCompact(value: number): string {
  if (value < 1_000) return value.toFixed(0);
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}

// ─── Known Token Registry ───────────────────────────────────────────────────
// Common Avalanche C-Chain tokens for display purposes.

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7": { symbol: "WAVAX", decimals: 18 },
  "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e": { symbol: "USDC", decimals: 6 },
  "0x152b9d0fdc40c096757f570a51e494bd4b943e50": { symbol: "BSGG", decimals: 18 },
  "0x18e3605b13f10016901eac609b9e188cf7c18973": { symbol: "HEFE", decimals: 18 },
  "0x201d04f88bc9b3bdacdf0519a95e117f25062d38": { symbol: "CAMRY", decimals: 18 },
};

export function getTokenInfo(address: string): { symbol: string; decimals: number } {
  const lower = address.toLowerCase();
  return KNOWN_TOKENS[lower] ?? { symbol: truncateAddress(address), decimals: 18 };
}

// ─── Time Formatting ────────────────────────────────────────────────────────

/** Returns a relative time string like "2m ago", "3h ago", "1d ago" */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/** Returns a formatted date string */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Snowscan Link ──────────────────────────────────────────────────────────

export function getTxUrl(txHash: string): string {
  return `https://snowtrace.io/tx/${txHash}`;
}

export function getAddressUrl(address: string): string {
  return `https://snowtrace.io/address/${address}`;
}
