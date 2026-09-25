# Golden Cuts — Premium Barbershop Platform

A complete full-stack booking platform: React (Vite) frontend + Node/Express + MongoDB backend,
dark charcoal + luxury gold theme, real-time barber availability, and an AI booking assistant
that only ever answers from real database data.

## Requirements
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm run seed               # creates demo services, barbers, gallery, reviews, admin + customer accounts
npm run dev                 # starts the API on http://localhost:5000
```

Demo accounts created by the seed script:
- **Admin** → email: `admin@goldencuts.com` / password: `Admin123!` — login at `/admin/login`
- **Customer** → email: `james@example.com` / password: `Customer123!` — login at `/login`

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # points at http://localhost:5000/api by default
npm run dev
```

Open **http://localhost:5173**.

## AI Assistant modes

The AI Assistant (bottom-right floating button) works out of the box with **no API key** using
a rule-based natural-language engine (`backend/utils/nlDates.js` + `backend/utils/aiTools.js`)
that always answers from live database data — services, barbers, real schedules and real
availability. It never invents prices, barbers, or open slots.

For richer, fully conversational natural-language understanding, add your own key to
`backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

When set, `backend/routes/ai.js` automatically switches to a full tool-use loop against the
Claude API — the model still calls the exact same real database functions (`getServices`,
`getBarberSchedule`, `getAvailableTimeSlots`, `createAppointment`, etc.) rather than guessing.

## What's included
- Two roles only: **user** and **admin** (no staff role, no role selector on signup)
- Full booking flow: service → barber (specific or any available) → date → time → confirm,
  with server-side double-booking protection
- Real per-barber working hours, breaks, and days off drive every available slot everywhere
  (booking page, my-appointments reschedule, and the AI assistant)
- Admin dashboard: appointments, services, barbers (with schedule editor), customers, gallery,
  reviews, contact messages, reports, and business settings — all backed by MongoDB
- Prices/durations are stored once in the database and used everywhere (home, services,
  booking, confirmations, admin, AI) — appointments snapshot the price at booking time so
  history never changes if prices change later
- JWT auth, bcrypt password hashing, admin routes protected server-side (never just the UI)
- Dark charcoal + luxury gold theme applied consistently across every public, customer and
  admin page, per the supplied design spec
- Fully responsive: hamburger nav on mobile, responsive grids/tables/booking flow

## Project structure
```
golden-cuts/
  backend/          Express API, MongoDB models, booking + AI logic
  frontend/          React (Vite) app, dark/gold themed UI
```

## Production notes
This is a runnable local/dev build. Before deploying publicly:
- Set a strong random `JWT_SECRET`
- Put the frontend behind HTTPS and update `VITE_API_URL` accordingly
- Replace the in-response password-reset token (`devResetToken`) with a real email flow
- Swap Unsplash seed image URLs for your own hosted photography
