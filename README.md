# World Cup Predictions

A free, responsive MVP for a World Cup score prediction game built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL, and Vercel.

## Features

- Email/password registration and login with Supabase Auth.
- Users predict match scores before kickoff.
- Users can edit only their own predictions before kickoff.
- Duplicate predictions are prevented by a database unique constraint.
- Admins create matches, edit kickoff time/status, and enter final results.
- Saving a final result sets the match to `finished` and recalculates points automatically.
- Leaderboard ranks users by total points and exact scores.
- Supabase Row Level Security protects user and admin actions.
- Responsive mobile-first interface.

## Scoring

- Exact score: 3 points
- Correct winner, but not exact score: 1 point
- Correct draw, but not exact score: 1 point
- Wrong prediction: 0 points

## Requirements

- Node.js 18.17 or newer
- npm
- A free Supabase project
- A free Vercel account for deployment

Docker is not required and is not used.

## Install

```bash
npm install
```

## Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Open Project Settings, then API.
3. Copy the Project URL and anon public key.
4. In the project root, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never put the Supabase service role key in frontend code or in `NEXT_PUBLIC_` variables.

## Run SQL Migration

1. In Supabase, open SQL Editor.
2. Open `supabase/migrations/001_initial_schema.sql` from this project.
3. Paste the full SQL into Supabase SQL Editor.
4. Run it once.

The migration creates:

- `profiles`
- `matches`
- `predictions`
- `leaderboard` view
- indexes
- RLS policies
- profile creation trigger after signup
- database trigger that blocks prediction changes after kickoff
- `finish_match_with_result` function that saves results and recalculates points

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Create the First Admin User

1. Register normally in the app.
2. In Supabase, open SQL Editor.
3. Run this SQL, replacing the email:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

4. Log out and log back in. The Admin link will appear in the navigation.

## Admin Workflow

1. Go to Admin, then Match Management.
2. Create a match with home team, away team, kickoff time, and status.
3. Users submit predictions before kickoff.
4. Go to Admin, then Result Entry.
5. Enter the final score and save.
6. Supabase automatically:
   - updates the result
   - sets status to `finished`
   - recalculates points for every prediction on that match
   - updates leaderboard results through the leaderboard view

## Deploy on Vercel

1. Push the project to GitHub.
2. Create a new Vercel project and import the repo.
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Project Structure

```text
src/app/(auth)          Login and register pages
src/app/(app)           Protected user and admin pages
src/components          Reusable UI and form components
src/lib                 Supabase clients, auth helpers, types, formatting
supabase/migrations     SQL migration scripts
```

## Notes for Beginner Developers

- UI checks make the app feel clear, but security is enforced in Supabase RLS and triggers.
- Users can only read and write their own predictions.
- Admin pages are protected by server-side role checks.
- Result entry uses a database function so scoring happens consistently.
- The leaderboard is a view, so it reflects latest prediction points automatically.
