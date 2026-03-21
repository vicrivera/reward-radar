# Reward Radar

**Real-time opportunity scanner for the [Moats](https://moats.app) ecosystem on Avalanche.**

Built for the [Moats App Extensions Hackathon](https://fortifi.gitbook.io/moats/hackathon-info/about) (March 2–30, 2026).

---

## The Problem

The Moats ecosystem has multiple active Moats with staking, locking, burning, and reward distribution happening on-chain every minute. But there's no way to know when something interesting happens without manually checking each Moat dashboard. By the time you notice a reward spike or a whale exit, the opportunity may have passed.

## The Solution

Reward Radar scans the entire Moats ecosystem every 20 seconds and surfaces actionable signals — so you can make smarter staking decisions without constantly watching dashboards.

Think of it as a **yield radar** that tells you:
- Which Moats are paying out rewards right now
- Where large burns or exits just happened (fewer stakers = bigger share for you)
- Which wallets are aggressively climbing ranks (follow smart money)
- When a top-ranked wallet exits a Moat (potential entry opportunity)

---

## Features

### Signal Detection Engine
Four real-time detectors analyze on-chain events as they happen:
- **Reward signals** — spikes in reward claims, large individual payouts, active distribution clusters
- **Burn signals** — token burns and early exits with penalty fees
- **Streak signals** — wallets rapidly climbing the leaderboard ranks
- **Unstake signals** — large lock exits, with extra weight for top-ranked wallets

### Opportunity Score
Every Moat gets a score from 0–100 combining all four signal types. A single number that answers: "How interesting is this Moat right now?"

### Cross-Moat Comparison
Side-by-side view of all Moats with score breakdowns, verdicts ("Hot opportunity" / "Quiet — potential entry"), and direct links to Snowtrace.

### Alerts
- **Browser notifications** — one-click enable, instant desktop alerts for high/critical signals
- **Sound alerts** — toggle on for audio pings when important signals land
- **Discord webhooks** — send formatted alerts to any Discord channel with configurable rules (signal type, severity, contract filter)
- **Email & Telegram** — coming soon (architecture ready)

### Shareable Alert Pages
Generate a link for any Moat that shows a live signal feed. Embed it on your project's website with a single iframe snippet. Useful for Moat creators who want to show their community what's happening.

### Gamification
8 badges across 3 tiers (bronze, silver, gold) that track your engagement:
- Early Bird, Whale Watcher, Critical Eye (gold)
- Signal Hunter, Moat Explorer, Streak Spotter (silver)
- Burn Notice, Alert Pro (bronze)

Badges are earned automatically and persist permanently.

### Live Staker Marquee
Top 10 stakers scroll across the top of the page — live social proof of who's leading the ecosystem.

### How It Works Page
Built-in documentation explaining the app in plain language for non-technical users. Covers what Moats is, what each signal type means, how to use every feature, and an FAQ.

---

## Screenshots

> Add screenshots of the dashboard, compare page, alerts page, and share page here before submission.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Polling & caching | TanStack React Query (stale-while-revalidate) |
| State management | Zustand with localStorage persistence |
| Styling | Tailwind CSS (custom Moats-branded dark theme) |
| Icons | Lucide React |
| Routing | React Router v7 |
| Deployment | Vercel |

**No backend required.** The app is fully client-side. API polling, signal detection, Discord webhooks, and browser notifications all run in the browser. User preferences, signal history, and earned badges persist in localStorage.

---

## API Integration

All data comes from the official [Moats App API](https://fortifi.gitbook.io/moats/extensions/moats-app-api):

| Endpoint | What we use it for | Poll interval |
|---|---|---|
| `GET /events` | Signal detection — rewards, burns, exits, unstakes | 20 seconds |
| `GET /moat-points/all` | Leaderboard, streak detection, staker marquee | 60 seconds |
| `GET /moat-points/all?contractAddress=` | Per-Moat detail views | 60 seconds |

Best practices followed: retry with exponential backoff, response caching, event deduplication by ID, address validation before queries.

---

## Architecture

```
src/
├── api/           Moats API client (fetch, retry, normalize)
├── engine/        Signal detection (pure functions), Discord webhooks, badge logic
├── hooks/         React Query polling hooks + signal processor
├── stores/        Zustand store (preferences, signals, badges — persisted)
├── components/
│   ├── feed/      SignalFeed, SignalCard, OpportunityBoard, FeedFilters,
│   │              StatsHeader, BadgeShowcase, TopStakers, StakerMarquee
│   ├── alerts/    AlertsPanel
│   ├── layout/    AppLayout (hero, sidebar, marquee, footer)
│   └── shared/    UIComponents (badges, cards, loaders, score ring)
├── pages/         DashboardPage, ComparePage, AlertsPage, SharePage,
│                  HowItWorksPage
├── utils/         Formatters, token registry, contract registry, notifications
└── types/         TypeScript interfaces
```

Key design decisions:
- **Signal engine is pure functions** — no side effects, fully testable, easy to add new detectors
- **Zustand over Context** — simpler API, built-in persistence middleware, no provider nesting
- **React Query over manual polling** — automatic retry, stale-while-revalidate, window focus refetching
- **No backend** — everything runs client-side for zero infrastructure cost and instant deployment
- **Badge persistence separate from signals** — badges use a permanent ID map, signals rotate (last 100)

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/reward-radar.git
cd reward-radar

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) and the radar starts scanning immediately.

---

## Deployment

The app is deployed on Vercel. Any push to `main` triggers an automatic deployment.

Live URL: **[your-url-here]**

---

## Roadmap (Post-Hackathon)

- [ ] Email alerts via custom server endpoint
- [ ] Telegram bot integration
- [ ] Supabase backend for global leaderboard and cross-device sync
- [ ] Wallet connection (read-only, for personalized signals)
- [ ] Historical opportunity score charts per Moat
- [ ] More Moat contract discovery (auto-detect from events)
- [ ] Mobile-optimized PWA with install prompt

---

## Credits

Created by [@vicdelarge](https://x.com/vicdelarge)

Powered by [The Moats](https://moats.app) — a [FortiFi](https://fortifi.network) protocol on Avalanche.

---

## License

MIT
