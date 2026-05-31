create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  page_key text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists page_visits_page_key_created_at_idx
on public.page_visits (page_key, created_at desc);

alter table public.page_visits enable row level security;
