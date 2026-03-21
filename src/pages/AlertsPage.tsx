import { useState, useEffect } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { RadarCard } from "@/components/shared/UIComponents";
import { sendDiscordAlert } from "@/engine";
import {
  requestNotificationPermission,
  getNotificationPermission,
} from "@/utils";
import type { Signal, SignalType, SignalSeverity } from "@/types";
import {
  BellRing,
  Volume2,
  VolumeX,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  TestTube2,
  MessageSquare,
  Mail,
  Send,
} from "lucide-react";

export function AlertsPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-radar-text-primary">
          Alerts
        </h2>
        <p className="text-sm text-radar-text-secondary mt-1">
          Get notified when the radar detects opportunities. No setup
          required — just enable notifications.
        </p>
      </div>

      <div className="space-y-4">
        <BrowserNotificationCard />
        <SoundAlertCard />
        <DiscordCard />
        <ComingSoonChannels />
        <AlertRulesCard />
      </div>
    </div>
  );
}

// ─── Browser Notifications (primary) ────────────────────────────────────────

function BrowserNotificationCard() {
  const [permission, setPermission] = useState(getNotificationPermission);

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

  return (
    <RadarCard className={permission === "granted" ? "radar-glow" : ""}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-radar-accent/10 flex items-center justify-center flex-shrink-0">
          <BellRing size={20} className="text-radar-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-radar-text-primary">
              Browser notifications
            </h3>
            {permission === "granted" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-radar-accent/15 text-radar-accent font-medium">
                Recommended
              </span>
            )}
          </div>
          <p className="text-[11px] text-radar-text-secondary mt-0.5">
            {permission === "granted"
              ? "You'll get instant desktop alerts for high and critical signals. No setup needed."
              : permission === "denied"
                ? "Notifications are blocked. Click the lock icon in your browser's address bar to enable them."
                : "One click to enable. You'll get instant desktop alerts when critical signals are detected."}
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
    </RadarCard>
  );
}

// ─── Sound Alerts ───────────────────────────────────────────────────────────

function SoundAlertCard() {
  // Simple toggle stored in localStorage directly
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
            Play a notification sound when high-priority signals land.
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

// ─── Discord (advanced) ─────────────────────────────────────────────────────

function DiscordCard() {
  const discordWebhookUrl = useRadarStore((s) => s.discordWebhookUrl);
  const setDiscordWebhookUrl = useRadarStore((s) => s.setDiscordWebhookUrl);
  const [expanded, setExpanded] = useState(!!discordWebhookUrl);
  const [webhookInput, setWebhookInput] = useState(discordWebhookUrl);
  const [testStatus, setTestStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [showGuide, setShowGuide] = useState(false);

  const handleSave = () => {
    setDiscordWebhookUrl(webhookInput.trim());
  };

  const handleTest = async () => {
    if (!discordWebhookUrl) return;
    setTestStatus("sending");

    const testSignal: Signal = {
      id: "test",
      type: "reward",
      severity: "medium",
      title: "Test alert from Reward Radar",
      description:
        "If you see this, your Discord webhook is configured correctly!",
      contractAddress: "0x0000000000000000000000000000000000000000",
      timestamp: new Date(),
      eventIds: [],
      meta: {},
    };

    const success = await sendDiscordAlert(discordWebhookUrl, testSignal);
    setTestStatus(success ? "success" : "error");
    setTimeout(() => setTestStatus("idle"), 3000);
  };

  return (
    <RadarCard>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={20} className="text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-radar-text-primary">
              Discord webhook
            </h3>
            {discordWebhookUrl && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
                Connected
              </span>
            )}
          </div>
          <p className="text-[11px] text-radar-text-secondary mt-0.5">
            Send signal alerts to a Discord channel. Requires server admin access.
          </p>
        </div>

        {expanded ? (
          <ChevronUp size={14} className="text-radar-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-radar-text-tertiary flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Setup guide toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-radar-accent hover:underline"
          >
            {showGuide ? "Hide setup guide" : "How do I get a webhook URL?"}
          </button>

          {showGuide && (
            <div className="p-3 rounded-lg bg-radar-bg border border-radar-border text-[11px] text-radar-text-secondary space-y-1.5">
              <p>1. Open Discord on your computer</p>
              <p>2. Go to the server where you want alerts</p>
              <p>
                3. Right-click a channel → <span className="text-radar-text-primary">Edit Channel</span> → <span className="text-radar-text-primary">Integrations</span> → <span className="text-radar-text-primary">Webhooks</span>
              </p>
              <p>
                4. Click <span className="text-radar-text-primary">New Webhook</span>, name it "Reward Radar"
              </p>
              <p>5. Click <span className="text-radar-text-primary">Copy Webhook URL</span></p>
              <p>6. Paste it below</p>
              <p className="text-radar-text-tertiary mt-2">
                Note: you need "Manage Webhooks" permission on the channel.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="url"
              value={webhookInput}
              onChange={(e) => setWebhookInput(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="flex-1 bg-radar-bg border border-radar-border rounded-lg px-3 py-2 text-xs font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none focus:border-radar-accent/50 transition-colors"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 transition-colors"
            >
              Save
            </button>
          </div>

          {discordWebhookUrl && (
            <button
              onClick={handleTest}
              disabled={testStatus === "sending"}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-radar-text-secondary hover:text-radar-text-primary transition-colors disabled:opacity-50"
            >
              {testStatus === "sending" ? (
                "Sending..."
              ) : testStatus === "success" ? (
                <>
                  <Check size={12} className="text-radar-accent" /> Sent!
                </>
              ) : testStatus === "error" ? (
                <>
                  <X size={12} className="text-radar-danger" /> Failed
                </>
              ) : (
                <>
                  <TestTube2 size={12} /> Send test message
                </>
              )}
            </button>
          )}
        </div>
      )}
    </RadarCard>
  );
}

// ─── Coming Soon Channels ───────────────────────────────────────────────────

function ComingSoonChannels() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ComingSoonCard
        icon={<Mail size={18} className="text-radar-text-tertiary" />}
        title="Email alerts"
        description="Daily digest or instant email notifications"
      />
      <ComingSoonCard
        icon={<Send size={18} className="text-radar-text-tertiary" />}
        title="Telegram bot"
        description="Real-time alerts in your Telegram DMs"
      />
    </div>
  );
}

function ComingSoonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <RadarCard className="opacity-60">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-10 h-10 rounded-xl bg-radar-border/30 flex items-center justify-center mb-2">
          {icon}
        </div>
        <h3 className="text-xs font-medium text-radar-text-primary">
          {title}
        </h3>
        <p className="text-[10px] text-radar-text-tertiary mt-0.5">
          {description}
        </p>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-radar-border/50 text-radar-text-tertiary mt-2 font-medium">
          Coming soon
        </span>
      </div>
    </RadarCard>
  );
}

// ─── Alert Rules ────────────────────────────────────────────────────────────

function AlertRulesCard() {
  const alertRules = useRadarStore((s) => s.alertRules);
  const addAlertRule = useRadarStore((s) => s.addAlertRule);
  const removeAlertRule = useRadarStore((s) => s.removeAlertRule);
  const toggleAlertRule = useRadarStore((s) => s.toggleAlertRule);
  const discordWebhookUrl = useRadarStore((s) => s.discordWebhookUrl);
  const [showAddRule, setShowAddRule] = useState(false);

  return (
    <RadarCard>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-radar-text-primary">
            Alert rules
          </h2>
          <p className="text-[10px] text-radar-text-tertiary mt-0.5">
            Customize which signals trigger Discord alerts
          </p>
        </div>
        <button
          onClick={() => setShowAddRule(!showAddRule)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-radar-accent hover:bg-radar-accent/10 rounded-lg transition-colors"
        >
          <Plus size={12} />
          Add rule
        </button>
      </div>

      {showAddRule && (
        <AddRuleForm
          onAdd={(rule) => {
            addAlertRule(rule);
            setShowAddRule(false);
          }}
          onCancel={() => setShowAddRule(false)}
        />
      )}

      {alertRules.length === 0 && !showAddRule ? (
        <p className="text-xs text-radar-text-tertiary text-center py-6">
          No alert rules yet. Browser notifications work automatically for
          high/critical signals — rules only affect Discord alerts.
        </p>
      ) : (
        <div className="space-y-2">
          {alertRules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                rule.enabled ? "bg-radar-bg/50" : "bg-radar-bg/30 opacity-60"
              }`}
            >
              <button
                onClick={() => toggleAlertRule(rule.id)}
                className={`w-8 h-5 rounded-full transition-colors relative ${
                  rule.enabled ? "bg-radar-accent" : "bg-radar-border-bright"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? "left-3.5" : "left-0.5"
                  }`}
                />
              </button>

              <div className="flex-1 min-w-0">
                <span className="text-xs text-radar-text-primary block">
                  {rule.signalType === "all"
                    ? "All signals"
                    : `${rule.signalType} signals`}
                  {" · "}
                  {rule.minSeverity}+ severity
                </span>
                {rule.contractAddress && (
                  <span className="text-[10px] font-mono text-radar-text-tertiary">
                    {rule.contractAddress.slice(0, 10)}...
                  </span>
                )}
              </div>

              <button
                onClick={() => removeAlertRule(rule.id)}
                className="p-1.5 text-radar-text-tertiary hover:text-radar-danger transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </RadarCard>
  );
}

// ─── Add Rule Form ──────────────────────────────────────────────────────────

function AddRuleForm({
  onAdd,
  onCancel,
}: {
  onAdd: (rule: {
    enabled: boolean;
    signalType: SignalType | "all";
    minSeverity: SignalSeverity;
    contractAddress?: string;
    webhookUrl: string;
  }) => void;
  onCancel: () => void;
}) {
  const discordWebhookUrl = useRadarStore((s) => s.discordWebhookUrl);
  const [signalType, setSignalType] = useState<SignalType | "all">("all");
  const [minSeverity, setMinSeverity] = useState<SignalSeverity>("medium");
  const [contractAddress, setContractAddress] = useState("");

  const handleSubmit = () => {
    onAdd({
      enabled: true,
      signalType,
      minSeverity,
      contractAddress: contractAddress.trim() || undefined,
      webhookUrl: discordWebhookUrl,
    });
  };

  return (
    <div className="p-3 mb-3 rounded-lg bg-radar-bg border border-radar-border space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-1">
            Signal type
          </label>
          <select
            value={signalType}
            onChange={(e) =>
              setSignalType(e.target.value as SignalType | "all")
            }
            className="w-full bg-radar-surface border border-radar-border rounded-lg px-3 py-1.5 text-xs text-radar-text-primary focus:outline-none focus:border-radar-accent/50"
          >
            <option value="all">All signals</option>
            <option value="reward">Rewards</option>
            <option value="burn">Burns</option>
            <option value="streak">Streaks</option>
            <option value="unstake">Unstakes</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-1">
            Min severity
          </label>
          <select
            value={minSeverity}
            onChange={(e) =>
              setMinSeverity(e.target.value as SignalSeverity)
            }
            className="w-full bg-radar-surface border border-radar-border rounded-lg px-3 py-1.5 text-xs text-radar-text-primary focus:outline-none focus:border-radar-accent/50"
          >
            <option value="low">Low+</option>
            <option value="medium">Medium+</option>
            <option value="high">High+</option>
            <option value="critical">Critical only</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-radar-text-tertiary uppercase tracking-wider block mb-1">
          Contract address (optional)
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x... (leave empty for all Moats)"
          className="w-full bg-radar-surface border border-radar-border rounded-lg px-3 py-1.5 text-xs font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none focus:border-radar-accent/50"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-radar-text-secondary hover:text-radar-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-radar-accent/10 border border-radar-accent/20 text-radar-accent rounded-lg text-xs font-medium hover:bg-radar-accent/20 transition-colors"
        >
          Add rule
        </button>
      </div>
    </div>
  );
}
