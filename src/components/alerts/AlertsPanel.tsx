import { useState } from "react";
import { useRadarStore } from "@/stores/radarStore";
import { RadarCard } from "@/components/shared/UIComponents";
import { sendDiscordAlert } from "@/engine";
import type { Signal, SignalType, SignalSeverity } from "@/types";
import { Bell, Trash2, Plus, TestTube2, Check, X } from "lucide-react";

export function AlertsPanel() {
  const discordWebhookUrl = useRadarStore((s) => s.discordWebhookUrl);
  const setDiscordWebhookUrl = useRadarStore((s) => s.setDiscordWebhookUrl);
  const alertRules = useRadarStore((s) => s.alertRules);
  const addAlertRule = useRadarStore((s) => s.addAlertRule);
  const removeAlertRule = useRadarStore((s) => s.removeAlertRule);
  const toggleAlertRule = useRadarStore((s) => s.toggleAlertRule);

  const [webhookInput, setWebhookInput] = useState(discordWebhookUrl);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [showAddRule, setShowAddRule] = useState(false);

  const handleSaveWebhook = () => {
    setDiscordWebhookUrl(webhookInput.trim());
  };

  const handleTestWebhook = async () => {
    if (!discordWebhookUrl) return;

    setTestStatus("sending");

    const testSignal: Signal = {
      id: "test",
      type: "reward",
      severity: "medium",
      title: "Test alert from Reward Radar",
      description: "If you see this, your Discord webhook is configured correctly!",
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
    <div className="space-y-4">
      {/* Webhook URL */}
      <RadarCard>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-radar-accent" />
          <h2 className="text-sm font-semibold text-radar-text-primary">
            Discord webhook
          </h2>
        </div>

        <p className="text-xs text-radar-text-secondary mb-3">
          Paste your Discord webhook URL to receive real-time signal
          alerts in your server.
        </p>

        <div className="flex gap-2">
          <input
            type="url"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="flex-1 bg-radar-bg border border-radar-border rounded-lg px-3 py-2 text-xs font-mono text-radar-text-primary placeholder:text-radar-text-tertiary focus:outline-none focus:border-radar-accent/50 transition-colors"
          />
          <button
            onClick={handleSaveWebhook}
            className="px-4 py-2 bg-radar-accent/10 border border-radar-accent/20 text-radar-accent rounded-lg text-xs font-medium hover:bg-radar-accent/20 transition-colors"
          >
            Save
          </button>
        </div>

        {discordWebhookUrl && (
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleTestWebhook}
              disabled={testStatus === "sending"}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-radar-text-secondary hover:text-radar-text-primary transition-colors disabled:opacity-50"
            >
              {testStatus === "sending" ? (
                <>
                  <span className="animate-spin">⏳</span> Sending...
                </>
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
                  <TestTube2 size={12} /> Send test
                </>
              )}
            </button>
          </div>
        )}
      </RadarCard>

      {/* Alert Rules */}
      <RadarCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-radar-text-primary">
            Alert rules
          </h2>
          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-radar-accent hover:bg-radar-accent/10 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Add rule
          </button>
        </div>

        {/* Add rule form */}
        {showAddRule && (
          <AddRuleForm
            onAdd={(rule) => {
              addAlertRule(rule);
              setShowAddRule(false);
            }}
            onCancel={() => setShowAddRule(false)}
          />
        )}

        {/* Existing rules */}
        {alertRules.length === 0 && !showAddRule ? (
          <p className="text-xs text-radar-text-tertiary text-center py-6">
            No alert rules configured. Add one to get notified.
          </p>
        ) : (
          <div className="space-y-2">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  rule.enabled
                    ? "bg-radar-bg/50"
                    : "bg-radar-bg/30 opacity-60"
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
                    {rule.signalType === "all" ? "All signals" : `${rule.signalType} signals`}
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
    </div>
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
            onChange={(e) => setSignalType(e.target.value as SignalType | "all")}
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
            onChange={(e) => setMinSeverity(e.target.value as SignalSeverity)}
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
