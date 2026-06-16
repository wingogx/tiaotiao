alter table public.income_records
add column if not exists income_type text not null default 'content';

alter table public.daily_posts
add column if not exists post_type text not null default 'business_review';

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.viewer_reactions (
  id uuid primary key default gen_random_uuid(),
  reaction_key text not null,
  visitor_key text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists income_records_income_type_idx
on public.income_records (income_type);

create index if not exists daily_posts_post_type_idx
on public.daily_posts (post_type);

create index if not exists post_comments_post_id_created_at_idx
on public.post_comments (post_id, created_at desc);

create index if not exists viewer_reactions_reaction_key_created_at_idx
on public.viewer_reactions (reaction_key, created_at desc);

drop trigger if exists post_comments_updated_at on public.post_comments;

create trigger post_comments_updated_at
before update on public.post_comments
for each row execute function public.set_updated_at();

alter table public.post_comments enable row level security;
alter table public.viewer_reactions enable row level security;
