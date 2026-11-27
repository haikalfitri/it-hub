# IT Hub — Design

Date: 2026-11-27 · Status: awaiting approval

## 1. Intent and why

IT Hub is a **public, clickable demo** for Haikal Fitri's resume and portfolio.
At Cypark, Haikal built an internal IT Help Center (SharePoint), digitised about
20 paper forms into a web system (AWS, Microsoft 365 SSO, Graph API, email
approvals, ticketing) and keeps the IT asset inventory. None of that can be shown
publicly. IT Hub rebuilds the same ideas with fake data so a recruiter can open
one link and, within about 60 seconds, *experience* a connected IT system:
a request is raised, approved, fulfilled from inventory, and the inventory updates.

The message it must carry: "this person designs connected IT systems and
business workflows, and builds them with care" (creativity + execution).

## 2. Goals, non-goals, anti-goals

**Goals**
- Works instantly in any browser, no sign-up, never goes to sleep.
- One visitor can play every role through a role switcher.
- The four workflows visibly change shared data (inventory, tickets, accounts).
- Looks designed and modern; strong first impression on Home and Dashboard.
- Honest About page explaining the real system it is based on.
- Fully responsive (phone, tablet, desktop), light/dark mode, accessible.

**Non-goals**
- No real backend, real authentication, or real email sending.
- No multi-user shared state; each visitor's data lives in their own browser.
- No guide videos in this phase (separate discussion later).
- No admin CMS for editing help articles in-app (content ships as data files).

**Anti-goals** (failure even if it technically works)
- Any real Cypark text, logo, screenshot, name, IP or internal data.
- A visitor gets stuck: broken state with no way back (hence Reset demo).
- It looks like a generic admin template / unstyled table dump.
- It reads as unconnected forms rather than one system.

## 3. Constraints

- Free hosting: **Netlify** (static site; SPA deep links via `public/_redirects`
  containing `/* /index.html 200`).
- Folder `C:\dev\it-hub`; GitHub repo `it-hub`; app title **"IT Hub"**.
- Fictional company **Demo Company Sdn Bhd**, emails `@demo.example`,
  defined in one config value so it can be renamed.
- Fake staff with Malaysian-style names across Operations, Finance, HR,
  Engineering, IT.
- Redaction rules from `Portfolio-notes/project-templates/README.md` apply.

## 4. Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| **A. Front-end-only demo**, data in browser, role switcher | No login friction, free forever, always up; no real backend to show | **Chosen** — instant working demo matters more to recruiters than an unseen backend |
| B. Full-stack (Supabase) | Shows DB/auth skills; login wall, free tier pauses, ~2× work | Rejected; could be a later phase |
| C. Rebuild in M365 dev tenant | Matches real stack; nobody outside can open it | Rejected |

Hosting: GitHub Pages, Cloudflare Pages and Netlify were considered; **Netlify**
was chosen by Haikal.

## 5. Decided parts of the how

### 5.1 Stack
React 18 + TypeScript + Vite, Tailwind CSS, shadcn/ui (Radix), Recharts,
Lucide icons, React Router (BrowserRouter + Netlify redirect). Vitest for tests.
State in a single store persisted to `localStorage` (Zustand with `persist`
is the builder's suggested choice), seeded from typed seed data.

### 5.2 Visual style
- **Hybrid**: Bento grid tiles on **Home** and **Dashboard**; Soft UI Evolution
  on working screens (forms, tables, detail views, approvals).
- Palette (from UI/UX Pro Max design system): primary indigo `#6366F1`,
  secondary `#818CF8`, accent green `#059669`, background `#F5F3FF`,
  card `#FFFFFF`, foreground `#312E81`, muted `#EBEFF9`, border `#E0E7FF`,
  destructive `#DC2626`. Dark-mode equivalents defined as tokens.
  *Builder's call (contrast):* `#6366F1` and `#059669` fail 4.5:1 with white
  text / as text on white, so they are used for fills and decoration only;
  buttons and coloured text use darker variants (indigo `#4F46E5`,
  green `#047857`).
- Type: Fira Sans (UI) + Fira Code (asset tags, IDs, serial numbers).
- Soft multi-layer shadows, radius 10px (cards) / 16px (bento tiles),
  200–300ms transitions, visible focus rings, `prefers-reduced-motion` honoured.
- SVG icons only (Lucide), no emoji icons. Contrast ≥ 4.5:1.
- Light mode default, follows system setting; manual toggle in header.
- Layout: left sidebar nav on desktop, drawer on mobile; header holds role
  switcher, theme toggle, Reset demo, tour button.

### 5.3 Roles (role switcher)
A header dropdown sets the "current user". Each role maps to a seeded person:

| Role | Seeded person (example) | Can |
|---|---|---|
| Staff | Aisyah Rahman, Finance | Raise tickets, submit workflow requests, view own assets |
| Manager | Daniel Tan, Finance Manager | Approve/reject requests from their team |
| HR | Priya Nair, HR | Start new-hire onboarding |
| IT Admin | Hafiz Ismail, IT | Work tickets, fulfil requests, manage inventory, verify returns, approve system access as system owner |

**Approval routing follows the reporting line (decided).** Every Person has a
`managerId`; a request goes to the *requester's own manager*. The role switcher
therefore lets the visitor pick **which person** within a role: one seeded
manager per department (Finance, Engineering, Operations, HR, IT), plus a few
staff. Default selections: Staff = Aisyah Rahman, Manager = Daniel Tan
(Finance), so the tour path stays simple. HR's onboarding form picks the
department, and the approver is that department's manager. A request's
detail view names the approver it is waiting on, so the visitor knows whom to
switch to (with a one-click "Switch to <approver>" button).

Navigation items and action buttons adapt to the current role. A notice shows
"You're viewing as …" so the visitor always knows the role.

### 5.4 Modules and routes
| Route | Module | Content |
|---|---|---|
| `/` | Home (Bento) | Greeting for current role, "Your tasks" tile (pending approvals / assigned work), quick actions, popular guides, latest announcement, start-tour CTA |
| `/help` | Help Center | ~12 guides by category, ~10 FAQs (accordion), announcements, full-text search across guides+FAQs; "Still stuck? Raise a ticket" leads to Service Desk with category prefilled |
| `/help/:slug` | Guide | Article page with steps, related guides, "Was this helpful?" (recorded locally) |
| `/tickets` | Service Desk | List with status filters; create ticket; detail view with status timeline and comments. Statuses: New → In progress → Resolved (+ Closed) with priority Low/Medium/High |
| `/assets` | Asset Inventory | Sortable/filterable table (type, status, site, owner); flags: warranty expiring ≤ 90 days, expired, no owner; detail page with full history timeline |
| `/workflows` | Workflows | Catalogue of 4 forms; "My requests"; "Awaiting my approval"; request detail with stepper showing each step, actor, timestamp, comment |
| `/dashboard` | Dashboard (Bento) | KPI tiles + charts: tickets by status, ticket trend (last 8 weeks), assets by type/status, warranty alerts, approvals pending by workflow |
| `/me` | My profile (all roles) | Current person's assigned assets, system access (Account), requests and tickets |
| `/people` | People directory (IT Admin, HR) | Staff list with department, manager, assets count, systems; person detail reuses the profile view |
| `/about` | About this project | Case study (see 5.8) |

*Builder's call:* `/me` and `/people` were added so onboarding and access
requests have a visible result.

### 5.5 Data model (seeded)
- **Person**: id, name, email, department, title, managerId, role.
- **Asset**: id, tag (e.g. `LAP-0012`), type (Laptop, Desktop, Monitor, Phone,
  Tablet, Peripheral), model, serial, status (In stock, Assigned, In repair,
  Retired), ownerId?, site, purchaseDate, warrantyEnd, history[] (event, actor,
  date, note).
- **Ticket**: id, title, description, category, priority, status, requesterId,
  assigneeId?, createdAt, comments[], linked request/asset ids.
- **Request** (workflow instance): id, type, data (form fields), status
  (Pending, Approved, Rejected, Completed, Cancelled), steps[] (role/actor,
  decision, comment, at), currentStep, createdAt.
- **Account**: personId, systems[] (e.g. Email, ERP, File share, VPN) —
  changed by onboarding and access requests.
- **Guide / FAQ / Announcement**: static content files.
- Seed size: ~25 people (one manager per department), ~45 assets (incl. 2–4 warranty-expiring, 1–2 no-owner),
  ~15 tickets across statuses and 8 weeks, ~6 requests in mixed states
  so every screen and chart looks alive on first visit.
- Dates in seed are **relative to "today"** at seed time so warranty flags and
  trends always look current.

### 5.6 The four workflows
Each completed workflow writes to shared data — the "connected system" proof.

1. **New-hire onboarding** — HR submits (name, department, start date, role,
   laptop needed, systems needed) → Manager approves → IT fulfils: assigns a
   laptop from In-stock inventory, creates the Person + Account with chosen
   systems, ticks an onboarding checklist (account created, laptop imaged,
   MFA set up, welcome guide sent). Effects: new Person, Asset → Assigned,
   Account created, asset history entry.
2. **Equipment request** — Staff submits (item type, reason, needed-by) →
   Manager approves → IT picks a matching In-stock asset and assigns it.
   Effects: Asset → Assigned to requester, history entry. If no stock, IT can
   mark "Awaiting stock" (request stays open).
3. **Laptop surrender & undertaking** — Staff submits (their assigned asset,
   reason: resignation/replacement/repair, condition, accessories returned,
   undertaking checkbox) → IT verifies by **typing the serial number**, which
   must match the inventory record (mismatch shows an error) → asset returns
   to In stock (or In repair if condition = damaged). Effects: owner cleared,
   status change, history entry.
4. **System access request** — Staff submits (system, access level,
   justification) → Manager approves → System owner (IT Admin) grants.
   Effects: Account.systems updated; visible on the requester's profile.

**Linked tickets (decided).** Submitting any workflow request also creates a
linked ticket in the Service Desk (category = workflow type, assignee = IT,
status New). The ticket shows the request's stepper and links to it; its
status follows the workflow (In progress once approved and with IT; Resolved
automatically when the workflow completes; Closed with the comment if
rejected). IT therefore sees all work in one queue, and the Dashboard counts
include it.

Rejection at any step ends the request with the comment shown. Every step
creates a notification in the bell menu for the next actor's role.

### 5.7 Guided tour
Auto-offers on first visit (dismissible; re-openable from header). ~6 steps:
(1) as Staff, open Equipment request and submit → (2) switch to Manager →
(3) approve → (4) switch to IT Admin → (5) assign a laptop → (6) open the
asset and see its history + Dashboard counts change. The tour switches roles
for the visitor when they press "Next" and highlights the target element.

*Builder's calls:* the visitor performs each real action (submit, approve,
assign) and the tour waits for the store change before advancing. The tour
starts from fresh seed data (confirm dialog if the visitor has changed data)
so an in-stock laptop always exists. A "Get back on track" button restores
the expected state for the current step if the visitor goes off course
(e.g. rejects instead of approving or navigates away).

### 5.8 About this project page
- The problem at work (scattered IT questions, ~20 paper forms, no ticketing,
  spreadsheet inventory) — written generically, no internal details.
- Haikal's role: designed the information architecture, workflows and system;
  built it with a colleague's guidance; flows approved by manager/HoD.
- Real system architecture as an SVG diagram with generic boxes: SharePoint
  Help Center; web app on AWS; Microsoft 365 SSO; Microsoft Graph API for user
  and org data; email approval links; hardware inventory linked to forms.
- What the demo simulates vs the real system (table).
- Tech stack of the demo; link to GitHub repo and portfolio.
- Clear statement: "Rebuild with fictional data of a system I built at Cypark.
  No company data is used."

### 5.9 Persistence and reset
All state in `localStorage` under one versioned key. **Reset demo** restores
seed data (confirm dialog). If stored data fails to parse or has an old
version, the app silently reseeds. Every read/write is wrapped so private
windows still work (in-memory fallback).

### 5.10 Quality
- Vitest unit tests for workflow transitions, inventory effects, serial check,
  warranty flag logic, and seed integrity.
- Accessibility: keyboard navigable, labelled controls, focus management in
  dialogs, charts have text summaries.
- Responsive breakpoints: 375 / 768 / 1024 / 1440.
- Lighthouse performance and accessibility ≥ 90 on the deployed site.

### 5.11 Deployment
GitHub repo `it-hub` connected to Netlify; build `npm run build`, publish
`dist`; `_redirects` for SPA routing. README with screenshots, live link,
feature list, and "how it's built".

## 6. Left to the builder
- Exact store library, folder structure, component breakdown.
- Exact seed records and guide/FAQ text (generic IT topics: VPN, MFA,
  password reset, printer, Outlook, Teams, Wi-Fi, OneDrive, new laptop setup,
  phishing reporting, software request, shared drive).
- Tour library or hand-built overlay.
- Exact chart choices within the Dashboard spec.
- Precise dark-mode token values (must keep ≥ 4.5:1 contrast).

## 7. Later (out of this phase)
- Guide videos (to be discussed).
- Optional Supabase backend.
- Linking from portfolio card #11 once deployed.
