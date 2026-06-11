create extension if not exists pgcrypto;

create table if not exists public.query_analytics (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid,
  property_id uuid,
  category text not null default 'other',
  intent text not null default 'general_question',
  guest_message text not null,
  assistant_reply text,
  detected_restaurants text[] not null default '{}',
  detected_activities text[] not null default '{}',
  detected_entities text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.query_analytics enable row level security;

create index if not exists query_analytics_created_at_idx
  on public.query_analytics(created_at desc);

create index if not exists query_analytics_property_created_at_idx
  on public.query_analytics(property_id, created_at desc);

create index if not exists query_analytics_category_idx
  on public.query_analytics(category);

create index if not exists query_analytics_restaurants_gin_idx
  on public.query_analytics using gin(detected_restaurants);

create index if not exists query_analytics_activities_gin_idx
  on public.query_analytics using gin(detected_activities);

comment on table public.query_analytics is
  'Per-message analytics for guest concierge queries: category, intent, restaurants, activities and entities.';
