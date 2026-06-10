create extension if not exists pgcrypto;

create table if not exists public.global_knowledge (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general',
  title text not null,
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_property_access (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  access_token_hash text not null unique,
  label text,
  active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

alter table public.conversations
  add column if not exists property_id uuid references public.properties(id) on delete set null;

create index if not exists global_knowledge_active_idx
  on public.global_knowledge(is_active, category);

create index if not exists guest_property_access_token_hash_idx
  on public.guest_property_access(access_token_hash);

create index if not exists guest_property_access_property_id_idx
  on public.guest_property_access(property_id);

create index if not exists conversations_property_id_created_at_idx
  on public.conversations(property_id, created_at desc);

alter table public.global_knowledge enable row level security;
alter table public.guest_property_access enable row level security;
alter table public.properties enable row level security;
alter table public.property_contacts enable row level security;
alter table public.property_instructions enable row level security;
alter table public.property_faq enable row level security;
alter table public.conversation_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'global_knowledge'
      and policyname = 'Anyone can read active global knowledge'
  ) then
    create policy "Anyone can read active global knowledge"
      on public.global_knowledge
      for select
      to anon, authenticated
      using (is_active = true);
  end if;
end $$;

-- Local property data intentionally has no anon/authenticated read policies.
-- Guests receive local data only through the server-side /api/chat route after
-- the route validates guest_property_access.access_token_hash.

comment on table public.global_knowledge is
  'General public knowledge shared across all properties.';

comment on table public.guest_property_access is
  'Hashed guest access tokens that authorize one guest link to one property.';

comment on table public.properties is
  'Property-local housing data. Expose to guests only through a verified guest property access token.';

comment on table public.property_contacts is
  'Property-local contacts such as host WhatsApp. Do not expose directly to anon clients.';

comment on table public.property_instructions is
  'Property-local instructions visible only to guests of that property.';

comment on table public.property_faq is
  'Property-local FAQ visible only to guests of that property.';
