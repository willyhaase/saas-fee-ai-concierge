-- Enable RLS on conversations and incidents.
-- These tables were created in schema.sql without RLS enabled.
-- All legitimate access goes through the service role key (which bypasses RLS).
-- Enabling RLS here denies all anon/authenticated access by default.
alter table public.conversations enable row level security;
alter table public.incidents enable row level security;

comment on table public.conversations is
  'Guest concierge conversation log. Service role access only (RLS enabled, no permissive policies).';

comment on table public.incidents is
  'Incidents raised from guest conversations. Service role access only (RLS enabled, no permissive policies).';

-- query_analytics, restaurant_contacts, and restaurant_reservations already
-- have RLS enabled (from their respective migration files) with no permissive
-- policies, so anon/authenticated access is already denied by default.
comment on table public.query_analytics is
  'Per-message analytics for guest concierge queries. Service role access only (RLS enabled, no permissive policies).';

comment on table public.restaurant_contacts is
  'Restaurant contact details used by the concierge. Service role access only (RLS enabled, no permissive policies).';

comment on table public.restaurant_reservations is
  'Restaurant reservation requests from chat. Service role access only (RLS enabled, no permissive policies).';
