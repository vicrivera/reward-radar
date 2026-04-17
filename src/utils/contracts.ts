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
  /** Image URL for the Moat card — replace with actual images */
  imageUrl?: string;
  /** Accent color hex for this Moat's card border */
  accentColor?: string;
}

const MOAT_REGISTRY: Record<string, MoatInfo> = {
  "0xcf65744c955a292d11de2a4184e9fabedbfc7b40": {
    name: "HEFE Moat",
    description: "Hefe Studios ecosystem staking",
    rewardToken: "0x18e3605b13f10016901eac609b9e188cf7c18973",
    imageUrl: "https://i.ibb.co/HTyxbsq3/Hefelogo-new.png",
    accentColor: "#E5A833",
  },
  "0x020c73b55d139d5e259bad89b126f2a446c22ac6": {
    name: "FREAK Anon Moat",
    description: "FREAK Anon token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://fortifi.fra1.cdn.digitaloceanspaces.com/FREAK_Anon.png",
    accentColor: "#3B82F6",
  },
  "0x3399d03566bb6db0cb4f1e13047589a1499cebbc": {
    name: "Bensi Moat",
    description: "Bensi Box ecosystem staking",
    imageUrl: "https://i.ibb.co/nMNcnpnd/Bensi-Box-logo-new.jpg",
    accentColor: "#10B981",
  },
  "0x7a4d20261a765bd9ba67d49fbf8189843eec3393": {
    name: "Lil Coq Moat",
    description: "Lil Coq token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/DHqPdkxY/LIL-Coq-Logo.png",
    accentColor: "#3B82F6",
  },
  "0x501f6e7bec3db63d8dacbc9fa0ce42d5d2329d53": {
    name: "LP WAVAX/hCASH Moat",
    description: "LP WAVAX/hCASH token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/LXFYNcJ6/hashcashclub.png",
    accentColor: "#3B82F6",
  },
  "0x7e1f28c9622aa68001fe0b200f5e5f93f6b35cc9": {
    name: "Balln Chikn Moat",
    description: "Balln Chikn token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/RTT2BWRK/balln-token.jpg",
    accentColor: "#3B82F6",
  },
  "0x93d8cc111233f8c5b9a019df7c159b6f9be7b44b": {
    name: "Dimish Moat",
    description: "DIMI token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/sv6DPXkH/Dimish1000px.png",
    accentColor: "#3B82F6",
  },
  "0x464b2817f16f6117602ad05bae446c2fc5ba6fb7": {
    name: "Supercycle (real) Moat",
    description: "Supercycle (real) token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/Z6FPpYS7/supercycle.jpg",
    accentColor: "#3B82F6",
  },
  "0x940b7f7d73a504ec566157eebb0566b81d57e8f8": {
    name: "Vitrene Moat",
    description: "Vitrene token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/0R2J3Vsm/VIT-Logo-Alternative-2.jpg",
    accentColor: "#3B82F6",
  },
  "0x9c5f177cdc0332e61e423ee9ad9e4f2333f62685": {
    name: "Where Is Malek Moat",
    description: "WHEREMALEK token staking",
    rewardToken: "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
    imageUrl: "https://i.ibb.co/1fwQhp7B/wheremalek.jpg",
    accentColor: "#3B82F6",
  },
  "0xd4280e25a7969da08b7093e8b54068d693def66e": {
    name: "Gator Dont Play Moat",
    description: "GATOR token staking",
    rewardToken: "0x1A31A8fD8BACB64b32dBcdcF5b2215f58Baf70c1",
    imageUrl: "https://i.ibb.co/twrWDLC9/GATOR-logo.jpg",
    accentColor: "#3B82F6",
  },
  "0xec7a708c9a9ac691d5e8be056bbd5c8251f003ea": {
    name: "SEEDS Moat",
    description: "SEEDS token staking",
    rewardToken: "",
    imageUrl: "https://i.ibb.co/0RRDSYjG/Seeds.png",
    accentColor: "#3B82F6",
  }
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
