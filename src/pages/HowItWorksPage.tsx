import { RadarCard } from "@/components/shared/UIComponents";
import { Link } from "react-router-dom";
import {
  Radio,
  Zap,
  Bell,
  Share2,
  BarChart3,
  Trophy,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export function HowItWorksPage() {
  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold text-radar-text-primary">
          How it works
        </h2>
        <p className="text-sm text-radar-text-secondary mt-2 leading-relaxed">
          Reward Radar watches the{" "}
          <a
            href="https://moats.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-radar-accent hover:underline"
          >
            Moats
          </a>{" "}
          ecosystem 24/7 and tells you when something interesting happens —
          so you can make smarter staking decisions without constantly
          checking dashboards.
        </p>
      </div>

      {/* What is Moats */}
      <Section
        icon={<Radio size={18} className="text-radar-accent" />}
        title="What is Moats?"
      >
        <p>
          Moats is a staking platform on the Avalanche blockchain. Projects
          create "Moats" where you can stake, lock, or burn tokens to earn
          rewards. Think of each Moat as a reward pool — you put tokens in,
          you earn rewards over time.
        </p>
        <p>
          Different Moats offer different rewards. Some are very active with
          lots of stakers claiming rewards. Others are quieter. Knowing
          which Moats are hot right now is valuable information.
        </p>
      </Section>

      {/* What does Reward Radar do */}
      <Section
        icon={<Zap size={18} className="text-radar-warning" />}
        title="What does Reward Radar do?"
      >
        <p>
          Instead of you manually checking each Moat to see what's
          happening, Reward Radar scans the entire ecosystem every 20
          seconds and highlights opportunities you might care about.
        </p>
        <p>We detect four types of signals:</p>

        <SignalExplainer
          emoji="💰"
          name="Reward signals"
          color="text-radar-accent"
          description="Someone just claimed a big reward, or multiple people are claiming rewards from the same Moat. This means the Moat is actively paying out — it might be a good time to stake there."
        />
        <SignalExplainer
          emoji="🔥"
          name="Burn signals"
          color="text-radar-danger"
          description="Someone burned tokens or exited their lock early (paying a penalty fee). Fewer stakers in a Moat means a bigger share of rewards for everyone who stays. This could be your entry opportunity."
        />
        <SignalExplainer
          emoji="🚀"
          name="Streak signals"
          color="text-radar-warning"
          description="A wallet is rapidly climbing the ranks — they're aggressively staking and accumulating points. Following what smart money does can help you find good opportunities early."
        />
        <SignalExplainer
          emoji="📤"
          name="Unstake signals"
          color="text-radar-blue"
          description="Someone unlocked a large amount of tokens from a Moat. This could mean they're moving to a better opportunity, or it could mean less competition for rewards in that Moat."
        />
      </Section>

      {/* Opportunity Score */}
      <Section
        icon={<BarChart3 size={18} className="text-radar-blue" />}
        title="The Opportunity Score"
      >
        <p>
          Every Moat gets a score from 0 to 100. This number combines all
          four signal types into a single answer to the question: "How
          interesting is this Moat right now?"
        </p>
        <div className="grid grid-cols-3 gap-3 my-4">
          <ScoreExample score="70-100" label="Hot" color="text-radar-accent" bg="bg-radar-accent/10" />
          <ScoreExample score="40-69" label="Active" color="text-radar-warning" bg="bg-radar-warning/10" />
          <ScoreExample score="0-39" label="Quiet" color="text-radar-text-tertiary" bg="bg-radar-border/30" />
        </div>
        <p>
          A high score doesn't mean "guaranteed profit" — it means there's
          a lot of activity happening right now, which usually means
          opportunity. A low score could mean it's a good time to get in
          before things heat up.
        </p>
      </Section>

      {/* How to use */}
      <Section
        icon={<ArrowRight size={18} className="text-radar-accent" />}
        title="How to use it"
      >
        <Step number={1} title="Check the Feed">
          The main page shows a live stream of detected signals. Each card
          tells you what happened, how significant it is (low / medium /
          high / critical), and which Moat it's from. Click any card to see
          details and a link to verify on Snowtrace.
        </Step>
        <Step number={2} title="Compare Moats">
          Go to the Compare page to see all Moats side by side. The score
          breakdown shows you exactly why each Moat has its score — is it
          from rewards? Burns? Rank volatility? This helps you decide where
          to focus.
        </Step>
        <Step number={3} title="Enable alerts">
          Go to the Alerts page and enable browser notifications for
          desktop alerts while the dashboard is open. Connect our{" "}
          <a href="https://t.me/MoatsRewardRadarBot" target="_blank" rel="noopener noreferrer" className="text-radar-accent hover:underline">
            Telegram bot
          </a>{" "}
          to get alerts even when you're away — just enough to know
          something happened, then come back here to decide.
        </Step>
        <Step number={4} title="Share with your community">
          Use the Share page to generate a link for any specific Moat. Your
          community members can see a live signal feed for that Moat. You
          can even embed it on your website.
        </Step>
      </Section>

      {/* Badges */}
      <Section
        icon={<Trophy size={18} className="text-radar-warning" />}
        title="Earning badges"
      >
        <p>
          As you use Reward Radar, you'll earn badges for different
          achievements. These are displayed in the sidebar and track your
          engagement with the ecosystem. Some examples:
        </p>
        <div className="grid grid-cols-2 gap-2 my-4">
          <BadgeExplainer image="/badges/earlybird.png" name="Early Bird" how="See a signal within 5 minutes of it happening" />
          <BadgeExplainer image="/badges/whalewatcher.png" name="Whale Watcher" how="Spot a top-ranked wallet making a move" />
          <BadgeExplainer image="/badges/criticaleye.png" name="Critical Eye" how="Detect a critical severity signal" />
          <BadgeExplainer image="/badges/signalhunter.png" name="Signal Hunter" how="Collect 10+ signals" />
          <BadgeExplainer image="/badges/moatexplorer.png" name="Moat Explorer" how="See signals from 3+ different Moats" />
          <BadgeExplainer image="/badges/streakspotter.png" name="Streak Spotter" how="Catch a hot streak signal" />
          <BadgeExplainer image="/badges/burntoken.png" name="Burn Notice" how="Witness a burn or early exit signal" />
          <BadgeExplainer image="/badges/alertpro.png" name="Alert Pro" how="Enable browser notifications" />
        </div>
        <p>
          Badges are saved permanently — you won't lose them even if you
          close the browser.
        </p>
      </Section>

      {/* FAQ */}
      <Section
        icon={<Radio size={18} className="text-radar-text-secondary" />}
        title="Common questions"
      >
        <FAQ
          q="Do I need to connect my wallet?"
          a="No. Reward Radar works without any wallet connection. You can optionally enter a wallet address to filter signals related to that specific address, but it's not required."
        />
        <FAQ
          q="Is this financial advice?"
          a="No. Reward Radar shows you what's happening in the Moats ecosystem in real time. It detects activity patterns and highlights them as signals. What you do with that information is up to you. Always do your own research."
        />
        <FAQ
          q="Where does the data come from?"
          a="All data comes directly from the official Moats API, which tracks on-chain events on the Avalanche C-Chain. Nothing is simulated or estimated — every signal is based on real blockchain activity."
        />
        <FAQ
          q="How often does it update?"
          a="Events are checked every 20 seconds. Staker rankings are checked every 60 seconds. You don't need to refresh the page — everything updates automatically."
        />
        <FAQ
          q="Does it cost anything?"
          a="No. Reward Radar is free to use. It's a community tool built for the Moats ecosystem."
        />
      </Section>

      {/* CTA */}
      <RadarCard className="mt-8 text-center py-6">
        <h3 className="text-sm font-semibold text-radar-text-primary mb-2">
          Ready to start?
        </h3>
        <p className="text-xs text-radar-text-secondary mb-4">
          Head to the feed and see what's happening right now.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-radar-accent/15 border border-radar-accent/25 text-radar-accent rounded-lg text-sm font-semibold hover:bg-radar-accent/25 transition-colors"
        >
          <Radio size={16} />
          Open the feed
        </Link>
      </RadarCard>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-3">
        {icon}
        <h3 className="text-base font-display font-semibold text-radar-text-primary">
          {title}
        </h3>
      </div>
      <div className="space-y-3 text-sm text-radar-text-secondary leading-relaxed pl-8">
        {children}
      </div>
    </div>
  );
}

function SignalExplainer({
  emoji,
  name,
  color,
  description,
}: {
  emoji: string;
  name: string;
  color: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-radar-surface/50 border border-radar-border/50 my-2">
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <div>
        <span className={`text-xs font-semibold ${color}`}>{name}</span>
        <p className="text-[11px] text-radar-text-secondary mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 my-3">
      <span className="w-6 h-6 rounded-full bg-radar-accent/15 text-radar-accent text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </span>
      <div>
        <span className="text-sm font-medium text-radar-text-primary block mb-1">
          {title}
        </span>
        <p className="text-[12px] text-radar-text-secondary leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
}

function ScoreExample({
  score,
  label,
  color,
  bg,
}: {
  score: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`text-center p-3 rounded-lg ${bg}`}>
      <span className={`text-lg font-display font-bold ${color}`}>{score}</span>
      <span className={`text-[10px] block mt-0.5 ${color}`}>{label}</span>
    </div>
  );
}

function BadgeExplainer({
  image,
  name,
  how,
}: {
  image: string;
  name: string;
  how: string;
}) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-radar-surface/50">
      <img src={image} alt={name} className="w-10 h-10 object-contain flex-shrink-0" />
      <div>
        <span className="text-[11px] font-medium text-radar-text-primary block">
          {name}
        </span>
        <span className="text-[10px] text-radar-text-tertiary">{how}</span>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="my-3">
      <p className="text-sm font-medium text-radar-text-primary">{q}</p>
      <p className="text-[12px] text-radar-text-secondary mt-1 leading-relaxed">
        {a}
      </p>
    </div>
  );
}