# Reward Radar

**Real-time opportunity scanner for the [Moats](https://moats.app) ecosystem on Avalanche.**

Built for the [Moats App Extensions Hackathon](https://fortifi.gitbook.io/moats/hackathon-info/about) (March 2–30, 2026).

## What it does

Reward Radar scans the Moats ecosystem every 20 seconds and tells you when something interesting happens — reward spikes, token burns, whale exits, rank streaks — so you can make smarter staking decisions without constantly checking dashboards.

Every Moat gets an **Opportunity Score** (0–100) that answers one question: "How interesting is this Moat right now?"

## Features

- **4 signal detectors** — rewards, burns, streaks, unstakes — with severity scoring
- **Opportunity Score** — weighted score per Moat combining all signal types
- **Cross-Moat comparison** — side-by-side with score breakdowns and verdicts
- **Browser notifications** — one-click enable, fires on medium+ signals
- **Telegram alerts** — real-time DM alerts via [@MoatsRewardRadarBot](https://t.me/MoatsRewardRadarBot), even when you're away from the dashboard
- **Shareable Moat pages** — direct link + iframe embed for communities
- **Top stakers marquee** — live ticker of the top 10 wallets
- **8 badges** — gamification across 3 tiers, earned automatically, persist permanently
- **Built-in guide** — plain language docs explaining everything for non-technical users
- **Email & Telegram alerts** — coming soon (architecture designed, server-side)

## Screenshots

> Add screenshots here before submission.

## Tech Stack

React 19 · TypeScript · Vite · TanStack React Query · Zustand · Tailwind CSS · Vercel

Fully client-side — no backend required. API polling, signal detection, and notifications all run in the browser.

## API

Uses the official [Moats App API](https://fortifi.gitbook.io/moats/extensions/moats-app-api): `/events` (every 20s) and `/moat-points/all` (every 60s). Retry with backoff, response caching, event deduplication.

## Getting Started

```bash
git clone https://github.com/vicrivera/reward-radar.git
cd reward-radar
npm install
npm run dev
```

## Live Demo

[https://reward-radar.vercel.app/](https://reward-radar.vercel.app/)

## Roadmap

- Email alerts (server-side, lightweight notifications that drive users back to the dashboard)
- Supabase backend for global leaderboard and cross-device sync
- Wallet connection for personalized signals
- Historical opportunity score charts

## Credits

Created by [@vicdelarge](https://x.com/vicdelarge)

Powered by [The Moats](https://moats.app) · [FortiFi](https://fortifi.network) on Avalanche

## License

MIT