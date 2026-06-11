create extension if not exists pgcrypto;

create table if not exists public.restaurant_contacts (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null unique,
  whatsapp_phone text,
  phone text,
  email text,
  accepts_whatsapp_reservations boolean not null default true,
  reservation_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_reservations (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid,
  property_id uuid,
  restaurant_name text not null,
  restaurant_whatsapp text,
  guest_name text,
  guest_contact text,
  party_size integer,
  reservation_date date,
  reservation_time text,
  special_requests text,
  status text not null default 'requested'
    check (
      status in (
        'requested',
        'sent_to_restaurant',
        'needs_restaurant_contact',
        'pending_whatsapp_config',
        'whatsapp_failed',
        'confirmed',
        'declined',
        'cancelled'
      )
    ),
  source text not null default 'chat',
  whatsapp_message_body text,
  whatsapp_message_id text,
  whatsapp_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurant_contacts enable row level security;
alter table public.restaurant_reservations enable row level security;

create index if not exists restaurant_contacts_name_idx
  on public.restaurant_contacts(restaurant_name);

create index if not exists restaurant_reservations_created_at_idx
  on public.restaurant_reservations(created_at desc);

create index if not exists restaurant_reservations_status_idx
  on public.restaurant_reservations(status);

create index if not exists restaurant_reservations_property_created_at_idx
  on public.restaurant_reservations(property_id, created_at desc);

comment on table public.restaurant_contacts is
  'Restaurant contact details used by the concierge for reservation requests.';

comment on table public.restaurant_reservations is
  'Restaurant reservation requests created from chat and optionally sent via WhatsApp Business Platform.';
