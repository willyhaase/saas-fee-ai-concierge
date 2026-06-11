create extension if not exists pgcrypto;

create table if not exists public.local_events (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  location text not null,
  category text not null default 'event',
  title text not null,
  start_date date not null,
  end_date date,
  time_text text,
  venue text,
  description text not null,
  price text,
  registration text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists local_events_active_dates_idx
  on public.local_events(is_active, start_date, end_date);

create index if not exists local_events_location_idx
  on public.local_events(location);

comment on table public.local_events is
  'Dated and recurring guest-facing events and activities in Saas-Fee/Saastal.';
