/**
 * Known Moat contract registry.
 *
 * Since the Moats API doesn't have an endpoint to list all contracts with names,
 * we maintain this map manually. It's built from:
 *   1. Observing contractAddress values in /events responses
 *   2. Cross-referencing reward tokens (HEFE token in rewards → HEFE Moat)
 *   3. Community knowledge from moats.app
 *
 * To add a new Moat: add its contract address (lowercased) with a display name.
 * Unknown contracts still work — they just show a truncated address.
 */

export interface MoatInfo {
  name: string;
  /** Short description for tooltips / cards */
  description?: string;
  /** Primary reward token address (if known) */
  rewardToken?: string;
}

const MOAT_REGISTRY: Record<string, MoatInfo> = {
  "0xcf65744c955a292d11de2a4184e9fabedbfc7b40": {
    name: "HEFE Moat",
    description: "Hefe Studios ecosystem staking",
    rewardToken: "0x18e3605b13f10016901eac609b9e188cf7c18973",
  },
  "0x020c73b55d139d5e259bad89b126f2a446c22ac6": {
    name: "CAMRY Moat",
    description: "Camry token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
  },
  "0x3399d03566bb6db0cb4f1e13047589a1499cebbc": {
    name: "Bensi Moat",
    description: "Bensi Box ecosystem staking",
  },
};

/**
 * Look up a Moat contract by address.
 * Returns the registry entry if known, otherwise a fallback with truncated address.
 */
export function getMoatInfo(contractAddress: string): MoatInfo {
  const lower = contractAddress.toLowerCase();
  const known = MOAT_REGISTRY[lower];

  if (known) return known;

  // Fallback: use truncated address as name
  return {
    name: `Moat ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`,
  };
}

/**
 * Returns all known Moat contract addresses.
 * Used by the Opportunity Board to show all Moats even when no signals exist.
 */
export function getKnownMoatAddresses(): string[] {
  return Object.keys(MOAT_REGISTRY);
}

/**
 * Checks if a contract address is in the known registry.
 */
export function isKnownMoat(contractAddress: string): boolean {
  return contractAddress.toLowerCase() in MOAT_REGISTRY;
}
