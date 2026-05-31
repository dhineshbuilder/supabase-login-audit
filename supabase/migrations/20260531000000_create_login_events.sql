create extension if not exists "pgcrypto";

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  logged_in_at timestamptz not null default now()
);

create index if not exists login_events_logged_in_at_idx
on public.login_events (logged_in_at desc);

create index if not exists login_events_user_id_idx
on public.login_events (user_id);

alter table public.login_events enable row level security;

revoke all on public.login_events from public;
revoke all on public.login_events from anon;
grant select, insert on public.login_events to authenticated;

drop policy if exists "Authenticated users can view login events"
on public.login_events;

create policy "Authenticated users can view login events"
on public.login_events
for select
to authenticated
using (auth.uid() is not null);

drop policy if exists "Users can insert their own login events"
on public.login_events;

create policy "Users can insert their own login events"
on public.login_events
for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.record_login_event()
returns public.login_events
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_event public.login_events;
  claims jsonb;
begin
  if auth.uid() is null then
    raise exception 'User must be authenticated';
  end if;

  claims := auth.jwt();

  insert into public.login_events (
    user_id,
    email,
    full_name,
    avatar_url
  )
  values (
    auth.uid(),
    claims ->> 'email',
    coalesce(
      claims #>> '{user_metadata,full_name}',
      claims #>> '{user_metadata,name}'
    ),
    claims #>> '{user_metadata,avatar_url}'
  )
returning * into new_event;

  return new_event;
end;
$$;

revoke all on function public.record_login_event() from public;
revoke all on function public.record_login_event() from anon;
grant execute on function public.record_login_event() to authenticated;
