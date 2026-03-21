import { SignalFeed } from "@/components/feed/SignalFeed";
import { OpportunityBoard } from "@/components/feed/OpportunityBoard";
import { StatsHeader } from "@/components/feed/StatsHeader";

export function DashboardPage() {
  return (
    <div>
      {/* Stats overview */}
      <StatsHeader />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <SignalFeed />
        </div>

        {/* Right sidebar */}
        <div className="xl:w-80 flex-shrink-0">
          <div className="space-y-4">
            <OpportunityBoard />
          </div>
        </div>
      </div>
    </div>
  );
}