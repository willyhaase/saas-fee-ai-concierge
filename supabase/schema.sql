create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_message text not null,
  assistant_message text not null,
  incident_required boolean not null default false,
  incident_id uuid,
  customer_name text,
  customer_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open',
  conversation_id uuid references public.conversations(id) on delete set null,
  customer_name text,
  customer_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_incident_id_fkey'
  ) then
    alter table public.conversations
      add constraint conversations_incident_id_fkey
      foreign key (incident_id)
      references public.incidents(id)
      on delete set null;
  end if;
end $$;

create index if not exists conversations_created_at_idx
  on public.conversations(created_at desc);

create index if not exists incidents_created_at_idx
  on public.incidents(created_at desc);

create index if not exists incidents_status_idx
  on public.incidents(status);
