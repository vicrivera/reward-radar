import { AlertsPanel } from "@/components/alerts/AlertsPanel";

export function AlertsPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-radar-text-primary">
          Alert configuration
        </h2>
        <p className="text-sm text-radar-text-secondary mt-1">
          Set up Discord webhook alerts to get notified when signals match your
          criteria.
        </p>
      </div>
      <AlertsPanel />
    </div>
  );
}
