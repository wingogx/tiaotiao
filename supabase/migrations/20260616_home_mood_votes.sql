create table if not exists public.home_mood_votes (
  id uuid primary key default gen_random_uuid(),
  mood text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists home_mood_votes_created_at_idx
on public.home_mood_votes (created_at desc);

create index if not exists home_mood_votes_mood_created_at_idx
on public.home_mood_votes (mood, created_at desc);

alter table public.home_mood_votes enable row level security;
