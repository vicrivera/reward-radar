import { SignalFeed } from "@/components/feed/SignalFeed";
import { OpportunityBoard } from "@/components/feed/OpportunityBoard";

export function DashboardPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0">
        <SignalFeed />
      </div>

      {/* Opportunity sidebar */}
      <div className="xl:w-80 flex-shrink-0">
        <div className="sticky top-20">
          <OpportunityBoard />
        </div>
      </div>
    </div>
  );
}
