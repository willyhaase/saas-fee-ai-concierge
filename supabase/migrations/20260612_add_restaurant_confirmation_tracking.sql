alter table public.restaurant_reservations
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmed_by_phone text,
  add column if not exists guest_confirmation_message_id text,
  add column if not exists guest_confirmation_error text;

create index if not exists restaurant_reservations_confirmed_at_idx
  on public.restaurant_reservations(confirmed_at desc);

comment on column public.restaurant_reservations.confirmed_at is
  'Timestamp when a restaurant manager confirmed the reservation.';

comment on column public.restaurant_reservations.confirmed_by_phone is
  'WhatsApp phone number that sent the confirmation reply.';

comment on column public.restaurant_reservations.guest_confirmation_message_id is
  'Twilio Message SID for the WhatsApp confirmation sent to the guest.';

comment on column public.restaurant_reservations.guest_confirmation_error is
  'Last error while sending the WhatsApp confirmation to the guest.';
