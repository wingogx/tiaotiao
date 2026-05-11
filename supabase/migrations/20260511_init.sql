create extension if not exists pgcrypto;
create extension if not exists pg_cron with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'guest' check (role in ('guest', 'member', 'admin')),
  can_view_articles boolean not null default false,
  display_name text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  site_title text not null,
  site_subtitle text not null,
  start_date date not null,
  total_days integer not null,
  total_target numeric(14, 2) not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint site_settings_singleton check (id = 1)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.income_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  amount numeric(12, 2) not null,
  note text,
  record_date date not null default (now() at time zone 'Asia/Shanghai')::date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('fixed', 'project_daily', 'project_once')),
  project_id uuid references public.projects(id) on delete cascade,
  scheduled_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  task_date date not null,
  title text not null,
  source_type text not null check (source_type in ('fixed', 'project_daily', 'project_once', 'temporary')),
  project_id uuid references public.projects(id) on delete set null,
  template_id uuid references public.task_templates(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  is_temporary boolean not null default false,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (task_date, template_id)
);

create table if not exists public.daily_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_url text,
  excerpt text not null,
  content_md text not null,
  post_date date not null default (now() at time zone 'Asia/Shanghai')::date,
  is_published boolean not null default true,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists income_records_record_date_idx on public.income_records (record_date desc);
create index if not exists daily_posts_post_date_idx on public.daily_posts (post_date desc);
create index if not exists daily_tasks_task_date_idx on public.daily_tasks (task_date desc);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger income_records_updated_at
before update on public.income_records
for each row execute function public.set_updated_at();

create trigger task_templates_updated_at
before update on public.task_templates
for each row execute function public.set_updated_at();

create trigger daily_tasks_updated_at
before update on public.daily_tasks
for each row execute function public.set_updated_at();

create trigger daily_posts_updated_at
before update on public.daily_posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.generate_daily_tasks(target_date date default (now() at time zone 'Asia/Shanghai')::date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.daily_tasks (task_date, title, source_type, project_id, template_id)
  select
    target_date,
    title,
    source_type,
    project_id,
    id
  from public.task_templates
  where is_active = true
    and (
      source_type = 'fixed'
      or source_type = 'project_daily'
      or (source_type = 'project_once' and scheduled_date = target_date)
    )
  on conflict (task_date, template_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

do $$
begin
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'generate-daily-tasks';
exception
  when undefined_table then
    null;
end;
$$;

select cron.schedule(
  'generate-daily-tasks',
  '0 1 * * *',
  $$select public.generate_daily_tasks((now() at time zone 'Asia/Shanghai')::date);$$
)
where not exists (
  select 1 from cron.job where jobname = 'generate-daily-tasks'
);

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.income_records enable row level security;
alter table public.task_templates enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.daily_posts enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated
using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

insert into public.site_settings (id, site_title, site_subtitle, start_date, total_days, total_target)
values (1, '1000天赚1000万 实盘跟踪日记', '一个人，一千天，一笔笔记录真实进展。', '2026-05-12', 1000, 10000000)
on conflict (id) do update
set site_title = excluded.site_title,
    site_subtitle = excluded.site_subtitle,
    start_date = excluded.start_date,
    total_days = excluded.total_days,
    total_target = excluded.total_target;
