# Cadence — LinkedIn Voice Engine for Sales Teams

Your AI content engine. Open it. See your post. Approve it. Done in 60 seconds.

## Stack

- **Next.js 14** (App Router)
- **Clerk** — Auth (email/password + Google + LinkedIn SSO)
- **Supabase** — Postgres database
- **Groq** — AI generation (llama-3.3-70b-versatile, server-side)
- **Tailwind CSS** — Styling
- **Vercel** — Deployment

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/cadence.git
cd cadence
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | clerk.com → your app → API Keys |
| `CLERK_SECRET_KEY` | clerk.com → your app → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → project → Settings → API |
| `GROQ_API_KEY` | console.groq.com |

### 3. Set up Supabase

In your Supabase project, go to **SQL Editor** and run the contents of `supabase/schema.sql`.

### 4. Set up Clerk

In your Clerk dashboard:
- Enable **Email/Password** authentication
- Enable **Google OAuth**
- Enable **LinkedIn OAuth**
- Set redirect URLs:
  - Sign in: `http://localhost:3000/sign-in`
  - Sign up: `http://localhost:3000/sign-up`
  - After sign in: `http://localhost:3000/dashboard`
  - After sign up: `http://localhost:3000/onboarding`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add all environment variables from `.env.local`
4. Deploy

Vercel auto-deploys on every push to `main`.

## Project structure

```
src/
├── app/
│   ├── api/generate/    # Groq API route (server-side, key never exposed)
│   ├── dashboard/       # Main app pages
│   ├── sign-in/         # Clerk auth pages
│   ├── sign-up/
│   └── page.tsx         # Landing page
├── components/
│   └── dashboard/       # All dashboard UI components
├── lib/
│   ├── generate.ts      # AI prompt builders + client helper
│   ├── supabase/        # Supabase client (browser + server)
│   └── utils.ts         # cn() helper
└── types/
    └── index.ts         # TypeScript types
supabase/
└── schema.sql           # Database schema — run in Supabase SQL editor
```
