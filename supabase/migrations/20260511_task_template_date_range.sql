alter table public.task_templates
add column if not exists start_date date,
add column if not exists end_date date;

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
      (
        source_type in ('fixed', 'project_daily')
        and (start_date is null or start_date <= target_date)
        and (end_date is null or end_date >= target_date)
      )
      or (source_type = 'project_once' and scheduled_date = target_date)
    )
  on conflict (task_date, template_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;
