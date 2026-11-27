# IT Hub: project tracker

Read this first in a new session, then `TODO.md`. Keep both current: update them at each milestone and whenever the session context gets large (around 80%), before anything long-running.

Last updated: 2026-11-27 (live and public on Netlify).

## What it is
A public, clickable portfolio demo of a connected IT system: Help Center, Service Desk, Asset Inventory, four approval workflows (onboarding, equipment, laptop surrender, system access), Dashboard, People/profiles, About page and a guided 6-step tour. It rebuilds, with fictional data, the internal system Haikal built at Cypark (SharePoint Help Center + ~20 digitised forms on AWS with M365 SSO). Owner: Haikal.

- Repo: https://github.com/haikalfitri/it-hub (public, branch `master`). Local: `C:\dev\it-hub`.
- Live: https://it-hub-ms.netlify.app/ (Netlify, public; visitor access had to be switched off in Netlify).
- Tour deep link: `/?tour=start`.
- Spec: `docs/superpowers/specs/2026-11-27-it-hub-design.md`. Plan: `docs/superpowers/plans/2026-11-27-it-hub.md`.

## Stack and structure
React 19 + TypeScript + Vite, Tailwind v4 + shadcn/ui (radix-nova), Recharts, Lucide, Zustand (persisted to localStorage key `it-hub:state`, schema v1), Vitest + Testing Library. Fonts Fira Sans / Fira Code self-hosted via @fontsource.
- `src/domain/` pure business rules + seed data (tested). `src/store/` Zustand store with safe storage. `src/content/` guides, FAQs, announcements. `src/pages/` one per route. `src/tour/` guided tour.
- Fake company "Demo Company Sdn Bhd", emails `@demo.example` (one place: `src/config.ts`).

## Environment notes
- Memory is tight: dev servers get killed. Start only when needed: `npm run dev` (port 5173).
- Headless Edge screenshots: minimum layout width is 504px and it lays out at 1410px while shooting 1440px; use an iframe page for 375px checks.
- `.superpowers/` is git-ignored.

## Done
- Brainstorm, grilling rounds, design doc, builder check, 16-task plan, native execution (all tasks).
- Final whole-branch review; fixed: seeded pending requests stuck after approval, error boundary, stricter saved-data checks, tour stuck on non-laptop item, `?tour=start` now confirms before reset.
- 112 tests pass. Lighthouse on the live site (mobile): performance 90 / 95 / 94 (Home / Assets / Dashboard), accessibility 100, best practices 100, SEO 91.
- Merged to `master`, public GitHub repo created with description and topics, deployed to Netlify.

## Decisions to remember
- Front-end only, no backend; Netlify hosting (user rejected Vercel and GitHub Pages).
- App name "IT Hub" (user rejected "Meridian").
- Style: Bento tiles on Home/Dashboard, Soft UI elsewhere; indigo + green; light/dark.
- Approvals follow the reporting line (requester's own manager); role switcher can pick a specific person.
- Every workflow request creates a linked Service Desk ticket that resolves/closes automatically.
- No real Cypark data or branding; Cypark is named only as employer on the About page and README.
- Guide videos: deferred, to be discussed.

## Next
See `TODO.md`.
