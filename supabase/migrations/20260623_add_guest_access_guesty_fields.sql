alter table public.guest_property_access
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists guesty_reservation_id text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists guest_property_access_guesty_reservation_idx
  on public.guest_property_access(guesty_reservation_id)
  where guesty_reservation_id is not null;

comment on column public.guest_property_access.guest_name is
  'Optional guest name imported from PMS/Guesty or entered for a guest link.';

comment on column public.guest_property_access.guesty_reservation_id is
  'Optional external Guesty reservation identifier for this guest access token.';

comment on column public.guest_property_access.metadata is
  'Optional structured metadata for the guest access token, for example checkIn/checkOut.';
