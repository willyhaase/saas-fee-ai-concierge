alter table public.properties
  add column if not exists guesty_listing_id text;

alter table public.guest_property_access
  add column if not exists guesty_reservation_id text,
  add column if not exists guesty_guest_id text,
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists source text not null default 'manual',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists last_synced_at timestamptz;

create unique index if not exists properties_guesty_listing_id_unique_idx
  on public.properties(guesty_listing_id)
  where guesty_listing_id is not null;

create unique index if not exists guest_property_access_guesty_reservation_unique_idx
  on public.guest_property_access(guesty_reservation_id)
  where guesty_reservation_id is not null;

create index if not exists guest_property_access_source_idx
  on public.guest_property_access(source);

comment on column public.properties.guesty_listing_id is
  'External Guesty listing id used to map Guesty reservations to local concierge properties.';

comment on column public.guest_property_access.guesty_reservation_id is
  'External Guesty reservation id. Used as the idempotency key for Guesty sync.';

comment on column public.guest_property_access.source is
  'Origin of the guest access record, for example manual or guesty.';

comment on column public.guest_property_access.metadata is
  'Provider-specific metadata for guest access records.';
