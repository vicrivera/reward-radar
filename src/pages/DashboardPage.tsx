import { SignalFeed } from "@/components/feed/SignalFeed";
import { OpportunityBoard } from "@/components/feed/OpportunityBoard";
import { StatsHeader } from "@/components/feed/StatsHeader";
import { ActivityPulse } from "@/components/feed/ActivityPulse";
import { TopStakers } from "@/components/feed/TopStakers";

export function DashboardPage() {
  return (
    <div>
      {/* Stats overview */}
      <StatsHeader />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <ActivityPulse />
          <SignalFeed />
        </div>

        {/* Sidebar */}
        <div className="xl:w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-0">
            <OpportunityBoard />
            <TopStakers />
          </div>
        </div>
      </div>
    </div>
  );
}
