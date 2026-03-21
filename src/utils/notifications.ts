import type { Signal, SignalType } from "@/types";
import { getMoatInfo } from "@/utils";

// ─── Permission ─────────────────────────────────────────────────────────────

/** Requests notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// ─── Send Notification ──────────────────────────────────────────────────────

const SIGNAL_ICONS: Record<SignalType, string> = {
  reward: "\u{1F4B0}",  // 💰
  burn: "\u{1F525}",    // 🔥
  streak: "\u{1F680}",  // 🚀
  unstake: "\u{1F4E4}", // 📤
};

export function sendBrowserNotification(signal: Signal): void {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const icon = SIGNAL_ICONS[signal.type] ?? "\u{1F4E1}"; // 📡
  const moat = signal.contractAddress
    ? getMoatInfo(signal.contractAddress).name
    : "";

  const notification = new Notification(
    `${icon} ${signal.title}`,
    {
      body: `${signal.description}${moat ? `\n${moat}` : ""}`,
      tag: signal.id, // Prevents duplicate notifications for same signal
      silent: false,
    }
  );

  // Auto-close after 8 seconds
  setTimeout(() => notification.close(), 8000);

  // Focus window on click
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Checks if a signal should trigger a browser notification.
 * Only fires for high and critical severity to avoid notification spam.
 */
export function shouldNotify(signal: Signal): boolean {
  return signal.severity === "high" || signal.severity === "critical";
}
