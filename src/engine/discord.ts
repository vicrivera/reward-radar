import type { Signal } from "@/types";

const SIGNAL_COLORS: Record<string, number> = {
  reward: 0x00e5a0,  // Green
  burn: 0xff4d6a,    // Red
  streak: 0xffb020,  // Amber
  unstake: 0x4da8ff,  // Blue
};

const SIGNAL_EMOJI: Record<string, string> = {
  reward: "💰",
  burn: "🔥",
  streak: "🚀",
  unstake: "📤",
};

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp: string;
  footer: { text: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

function buildEmbed(signal: Signal): DiscordEmbed {
  const emoji = SIGNAL_EMOJI[signal.type] ?? "📡";

  return {
    title: `${emoji} ${signal.title}`,
    description: signal.description,
    color: SIGNAL_COLORS[signal.type] ?? 0x5e6070,
    timestamp: signal.timestamp.toISOString(),
    footer: { text: `Reward Radar • Severity: ${signal.severity}` },
    fields: signal.contractAddress
      ? [
          {
            name: "Moat Contract",
            value: `\`${signal.contractAddress}\``,
            inline: true,
          },
          {
            name: "Severity",
            value: signal.severity.toUpperCase(),
            inline: true,
          },
        ]
      : undefined,
  };
}

/**
 * Sends a signal notification to a Discord webhook.
 * Fires directly from the browser — Discord webhook URLs accept
 * cross-origin POST requests.
 */
export async function sendDiscordAlert(
  webhookUrl: string,
  signal: Signal
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Reward Radar",
        avatar_url: "https://moats.app/favicon.ico",
        embeds: [buildEmbed(signal)],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Discord webhook failed:", error);
    return false;
  }
}

/**
 * Sends a batch of signals (max 10 embeds per Discord message).
 */
export async function sendDiscordAlertBatch(
  webhookUrl: string,
  signals: Signal[]
): Promise<boolean> {
  const embeds = signals.slice(0, 10).map(buildEmbed);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Reward Radar",
        avatar_url: "https://moats.app/favicon.ico",
        content:
          signals.length > 10
            ? `📡 ${signals.length} new signals detected (showing first 10)`
            : undefined,
        embeds,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Discord webhook batch failed:", error);
    return false;
  }
}
