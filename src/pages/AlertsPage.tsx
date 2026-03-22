import { useState, useEffect } from "react";
import { RadarCard } from "@/components/shared/UIComponents";
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from "@/utils";
import type { Signal } from "@/types";
import {
  BellRing,
  Volume2,
  VolumeX,
  Check,
  X,
  Mail,
  Send,
  Rocket,
} from "lucide-react";

export function AlertsPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-radar-text-primary">
          Alerts
        </h2>
        <p className="text-sm text-radar-text-secondary mt-1 leading-relaxed">
          Get notified when the radar detects big moves. Alerts tell you
          something happened — come back to the dashboard to see the full
          picture and decide.
        </p>
      </div>

      <div className="space-y-4">
        <BrowserNotificationCard />
        <SoundAlertCard />
        <ComingSoonSection />
      </div>
    </div>
  );
}

// ─── Browser Notifications (primary, works today) ───────────────────────────

function BrowserNotificationCard() {
  const [permission, setPermission] = useState(getNotificationPermission);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = () => setPermission(getNotificationPermission());
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  if (permission === "unsupported") return null;

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
  };

  const handleTest = () => {
    const testSignal: Signal = {
      id: `test-${Date.now()}`,
      type: "reward",
      severity: "medium",
      title: "Reward spike in HEFE Moat",
      description: "If you see this, browser notifications are working!",
      contractAddress: "0x0000000000000000000000000000000000000000",
      timestamp: new Date(),
      eventIds: [],
      meta: {},
    };

    try {
      sendBrowserNotification(testSignal);
    } catch (err) {
      console.error("Notification failed:", err);
    }
  };

  return (
    <RadarCard className={permission === "granted" ? "radar-glow" : ""}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-radar-accent/10 flex items-center justify-center flex-shrink-0">
          <BellRing size={20} className="text-radar-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-radar-text-primary">
            Browser notifications
          </h3>
          <p className="text-[11px] text-radar-text-secondary mt-0.5">
            {permission === "granted"
              ? "Active — you'll get desktop alerts when signals are detected while the dashboard is open."
              : permission === "denied"
                ? "Blocked — click the lock icon in your browser's address bar to enable."
                : "One click to enable. Get desktop alerts when the radar detects opportunities."}
          </p>
        </div>

        {permission === "granted" ? (
          <span className="flex items-center gap-1 text-xs text-radar-accent font-medium flex-shrink-0">
            <Check size={14} />
            Active
          </span>
        ) : permission === "denied" ? (
          <span className="flex items-center gap-1 text-xs text-radar-danger flex-shrink-0">
            <X size={14} />
            Blocked
          </span>
        ) : (
          <button
            onClick={handleEnable}
            className="px-4 py-2 bg-radar-accent/15 border border-radar-accent/25 text-radar-accent rounded-lg text-xs font-semibold hover:bg-radar-accent/25 transition-colors flex-shrink-0"
          >
            Enable
          </button>
        )}
      </div>

      {permission === "granted" && (
        <div className="mt-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-[10px] text-radar-text-tertiary hover:text-radar-text-secondary transition-colors"
          >
            {showHelp ? "Hide help" : "Not seeing notifications?"}
          </button>

          {showHelp && (
            <div className="mt-2 p-3 rounded-lg bg-radar-bg border border-radar-border text-[11px] text-radar-text-secondary space-y-2">
              <p className="font-medium text-radar-text-primary">
                Tap the button below to test. If you don't see a
                notification, check these settings:
              </p>
              <button
                onClick={handleTest}
                className="px-3 py-1.5 bg-radar-accent/15 border border-radar-accent/25 text-radar-accent rounded-lg text-[11px] font-medium hover:bg-radar-accent/25 transition-colors"
              >
                Send test notification
              </button>
              <p>
                <span className="text-radar-text-primary">Mac:</span>{" "}
                System Settings → Notifications → find your browser → make
                sure notifications are allowed. Also check that Focus / Do
                Not Disturb is off.
              </p>
              <p>
                <span className="text-radar-text-primary">Windows:</span>{" "}
                Settings → System → Notifications → make sure your browser
                is enabled. Check that Focus Assist is off.
              </p>
              <p>
                <span className="text-radar-text-primary">Browser:</span>{" "}
                Click the lock icon next to the URL in the address bar →
                Notifications should say "Allow".
              </p>
            </div>
          )}
        </div>
      )}
    </RadarCard>
  );
}

// ─── Sound Alerts ───────────────────────────────────────────────────────────

function SoundAlertCard() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("radar-sound-alerts") === "true";
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("radar-sound-alerts", String(next));
  };

  return (
    <RadarCard>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-radar-warning/10 flex items-center justify-center flex-shrink-0">
          {enabled ? (
            <Volume2 size={20} className="text-radar-warning" />
          ) : (
            <VolumeX size={20} className="text-radar-text-tertiary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-radar-text-primary">
            Sound alerts
          </h3>
          <p className="text-[11px] text-radar-text-secondary mt-0.5">
            Play a notification sound when signals are detected.
          </p>
        </div>

        <button
          onClick={toggle}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
            enabled ? "bg-radar-accent" : "bg-radar-border-bright"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              enabled ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </RadarCard>
  );
}

// ─── Coming Soon — Email & Telegram ─────────────────────────────────────────

function ComingSoonSection() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 mt-6">
        <Rocket size={14} className="text-radar-text-tertiary" />
        <h3 className="text-sm font-semibold text-radar-text-primary">
          Coming soon
        </h3>
      </div>
      <p className="text-[11px] text-radar-text-secondary mb-4 leading-relaxed">
        Get alerts even when you're away from the dashboard. We'll send you
        just enough to know something big happened — then come back here to
        see the full picture and decide your next move.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ComingSoonCard
          icon={<Mail size={20} className="text-radar-blue" />}
          iconBg="bg-radar-blue/10"
          title="Email alerts"
          description="Get notified when high-priority signals are detected. No spam — only the big moves."
          example="🔥 Big move in HEFE Moat — open your dashboard"
        />
        <ComingSoonCard
          icon={<Send size={20} className="text-radar-accent" />}
          iconBg="bg-radar-accent/10"
          title="Telegram bot"
          description="Real-time alerts straight to your Telegram. The fastest way to catch opportunities."
          example="💰 Reward spike across 2 Moats — check Reward Radar"
        />
      </div>
    </div>
  );
}

function ComingSoonCard({
  icon,
  iconBg,
  title,
  description,
  example,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <RadarCard>
      <div className="flex flex-col items-center text-center py-3">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-radar-text-primary">
          {title}
        </h3>
        <p className="text-[10px] text-radar-text-secondary mt-1 leading-relaxed">
          {description}
        </p>
        <p className="text-[10px] text-radar-text-tertiary mt-2 italic">
          "{example}"
        </p>
        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-radar-accent/10 text-radar-accent mt-3 font-medium">
          Coming soon
        </span>
      </div>
    </RadarCard>
  );
}