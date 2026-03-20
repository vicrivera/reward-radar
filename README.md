# Reward Radar — Moats Opportunity Scanner

> Real-time signal detection and alerts for the [Moats](https://moats.app) ecosystem on Avalanche.

Built for the **Moats App Extensions Hackathon** (March 2–30, 2026).

## What it does

Reward Radar turns passive Moats API data into **actionable alpha**. Instead of checking leaderboards manually, the app continuously scans for opportunities and alerts you when something interesting happens:

- **Reward Drops** — Detects spikes in `RewardClaimed` events across Moats
- **Burns & Early Exits** — Flags large token burns and penalty exits (fewer stakers = bigger share)
- **Hot Streaks** — Tracks wallets climbing ranks fast (follow smart money)
- **Unstake Signals** — Alerts when top wallets unlock capital (entry/exit opportunities)

Each Moat gets an **Opportunity Score** (0–100) combining all four signal types, so you can instantly see where the action is.

## Features

- Live signal feed with type/severity/time filtering
- Opportunity leaderboard ranking Moats by score
- Discord webhook alerts with configurable rules
- Shareable per-Moat alert pages (direct link + embeddable widget)
- Wallet filter to personalize your feed
- PWA-ready for mobile home screen

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TanStack React Query** — smart polling with stale-while-revalidate
- **Zustand** — lightweight state management with localStorage persistence
- **Tailwind CSS** — custom dark theme
- **Lucide React** — icons
- Deployed on **Vercel**

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Integration

Uses the [Moats App API](https://fortifi.gitbook.io/moats/extensions/moats-app-api):

| Endpoint | Usage | Poll Interval |
|---|---|---|
| `GET /events` | Signal detection (rewards, burns, exits) | 20s |
| `GET /moat-points/all` | Leaderboard + streak detection | 60s |
| `GET /moat-points/all?contractAddress=` | Per-Moat views | 60s |

## Architecture

```
src/
├── api/        → Moats API client with retry + normalization
├── engine/     → Signal detection (pure functions) + Discord webhooks
├── hooks/      → React Query polling + signal processing
├── stores/     → Zustand store (preferences, alerts, runtime state)
├── components/ → UI components (feed, alerts, layout, shared)
├── pages/      → Route-level pages
└── utils/      → Formatters (addresses, amounts, time)
```

## License

MIT
