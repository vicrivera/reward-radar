import type { Signal, SignalType } from "@/types";
import { getMoatInfo } from "./contracts";

// ─── Permission ─────────────────────────────────────────────────────────────

/** Requests notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in globalThis)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in globalThis)) return "unsupported";
  return Notification.permission;
}

// ─── Send Notification ──────────────────────────────────────────────────────

const SIGNAL_ICONS: Record<SignalType, string> = {
  reward: "\u{1F4B0}",
  burn: "\u{1F525}",
  streak: "\u{1F680}",
  unstake: "\u{1F4E4}",
  lock: "\u{1F512}",
};

export function sendBrowserNotification(signal: Signal): void {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const icon = SIGNAL_ICONS[signal.type] ?? "\u{1F4E1}";
  const moat = signal.contractAddress
    ? getMoatInfo(signal.contractAddress).name
    : "";

  try {
    const n = new Notification(
      `${icon} ${signal.title}`,
      {
        body: `${signal.description}${moat ? `\n${moat}` : ""}`,
        tag: `radar-${Date.now()}`,
        requireInteraction: false,
      }
    );

    setTimeout(() => n.close(), 8000);

    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Silently fail — OS or browser blocked it
  }
}

/**
 * Checks if a signal should trigger a browser notification.
 * Fires for medium, high, and critical severity.
 */
export function shouldNotify(signal: Signal): boolean {
  return signal.severity === "medium" || signal.severity === "high" || signal.severity === "critical";
}