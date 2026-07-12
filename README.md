# TransitOps: Smart Transport Operations Platform

A centralized fleet operations platform built end-to-end in a single 5-hour hackathon sprint — vehicle registry, driver management, trip dispatch, maintenance workflows, and cost analytics, all backed by a live Postgres database with enforced business rules, not just CRUD screens.

---

## Modules Built

| Module | Description |
|---|---|
| Auth | Supabase Auth (email/password), role-stored profile, protected routes |
| Vehicles | CRUD, unique registration constraint, status lifecycle |
| Drivers | CRUD, license expiry tracking, status lifecycle |
| Trips | Draft → Dispatched → Completed/Cancelled, 5 enforced business rules |
| Maintenance | Auto vehicle status transition on log open/close |
| Fuel & Expenses | Per-vehicle cost logging and aggregation |
| Dashboard | Live KPIs from real aggregate queries |
| Reports | Fuel efficiency, utilization, ROI, CSV export |

---

## Business Rules Enforced (Trip Dispatch)

| # | Rule | Where enforced |
|---|---|---|
| 1 | Registration number uniqueness | Database constraint |
| 2 | Retired/In Shop vehicles excluded from dispatch | Query filter + re-check at dispatch |
| 3 | Suspended/expired-license drivers excluded | Query filter + re-check at dispatch |
| 4 | Vehicle/driver already `on_trip` blocked from reassignment | Live re-fetch at dispatch time |
| 5 | Cargo weight ≤ vehicle max load capacity | Checked at creation AND at dispatch |

**Status transitions:** Dispatch → vehicle + driver → `on_trip`. Complete → both → `available`, vehicle odometer updated. Cancel → reverts only if trip had actually been dispatched (a still-draft trip never locked anything).

---

## Live Application

Every page reads and writes real Supabase data — no mock/hardcoded values remain anywhere in the final build. Route guards on all operational pages redirect unauthenticated users to `/login`.

- **Pages:** Home, Login/Signup, Account, Dashboard, Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses, Reports
- **To run:** `npm install`, add `.env.local` with your Supabase URL and publishable key, `npm run dev`

---

## Build & Run

```bash
npm install
npm run dev
```

Requires a Supabase project with the schema applied and `.env.local` configured — see Setup below.

## Requirements
- Node.js 18+
- A Supabase project (free tier is sufficient)

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts        # Supabase client init
│   └── theme.ts            # Shared style tokens (no CSS framework)
├── components/
│   └── ProtectedRoute.tsx  # Auth guard wrapper
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Account.tsx
│   ├── Dashboard.tsx
│   ├── Vehicles.tsx
│   ├── Drivers.tsx
│   ├── Trips.tsx
│   ├── Maintenance.tsx
│   ├── FuelExpenses.tsx
│   └── Reports.tsx
└── App.tsx                 # Routing, nav, account menu
```

---

## Setup

1. Clone the repo and run `npm install`
2. Create a Supabase project, run the schema SQL (ask a team member for the setup script if not included)
3. Create `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```
4. In Supabase → Authentication → Providers → Email, turn **off** "Confirm email" to avoid rate-limit issues during testing
5. `npm run dev`

---

## Why This Project

The spec gave us a fixed set of "mandatory business rules" and it was tempting to treat them as a checklist — build a form for each entity, wire up the fields, call it done. We didn't want a demo where the rules were decorative (present in a validation message somewhere) rather than actually structural to how the app behaves.

That's why the dispatch flow re-validates everything live instead of trusting whatever was true at trip creation — it was the one place in the spec where "mandatory" and "automatic" showed up together (dispatching *automatically* changes status; a driver *cannot* be assigned twice), and we treated that as the part worth getting right even under time pressure, rather than the part to fake for the demo.

The three-person build also meant merge conflicts were a constant, not an edge case — Login.tsx alone went through two separate merges (routing shell, then real auth logic) without losing either half. Getting comfortable resolving those live, rather than avoiding them by working in isolation until the end, was as much a part of this project as any single feature.

## Future Work

- Enforce role-based access control in the UI (currently the `role` field exists on every profile but doesn't gate any specific screen or action)
- Fold Maintenance cost into Operational Cost / ROI calculations (currently only Fuel + Expenses are counted — `maintenance_logs` has no cost field yet)
- Replace the manually-entered Revenue figure on the Reports page with a real revenue/billing source
- Re-enable email confirmation with a proper SMTP provider before any real deployment (disabled during the hackathon specifically to avoid Supabase's default rate limit)