# NEXUS — Personal Operating System

A premium, dark, glassmorphic personal dashboard: daily routine, goals, calendar, focus mode, achievements, and reflections — all stored locally in your browser.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview it with:

```bash
npm run preview
```

## Deploy

`dist/` is a static site — deploy it to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host. No backend required.

## What's included in this version

- Entry ritual (Welcome + Today's Insight quote)
- Dashboard with animated progress ring, streak, focus minutes, quote of the day
- Daily Routine: add / edit / delete tasks, priority, time estimate, completion with a soft blue glow + "what did you learn" reflection
- Goals: 30 / 60 / 90 / 180 / 365-day goals with progress tracking
- Calendar: month view with complete (gold) / in-progress (blue) / missed day states, click a day for details
- Focus Mode: fullscreen blurred timer (25 / 50 / 90 / custom) with a soft completion chime
- Achievements: unlockable badges based on streaks and tasks completed
- Evening Reflection: "What went well / wrong / improve tomorrow"
- AI Coach banner: contextual nudges based on your last 7 days
- Everything persists in `localStorage` — nothing is lost on refresh

## Not yet built (see the original brief's "Future Features")

Dark/Light toggle, cloud sync, PDF/Excel export, backup import, multiple profiles, AI daily planning, voice notes, habit/book/workout/finance/reading/meditation trackers, life score. These are natural next additions on top of this foundation — ask and I can build any of them next.

## Design tokens

Background `#050505` · Card `rgba(255,255,255,0.05)` · Border `rgba(255,255,255,0.10)` · Primary `#007AFF` · Secondary `#5AC8FA` · Accent `#8B5CF6` · Radius `24–34px` · Backdrop blur `25px` · Font: Inter
