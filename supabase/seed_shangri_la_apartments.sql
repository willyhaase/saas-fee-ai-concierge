-- Seed template for Shangri-La Saas-Fee apartments.
-- Source: https://shangri-la-saas-fee.ch/wohnungen/
--
-- Public apartment list:
-- Nadelhorn, Suedlenz, Weissmies, Taeschhorn, Allalin, Alphubel,
-- Strahlhorn, Fletschhorn, Felskinn.

create extension if not exists pgcrypto;

alter table public.properties
  add column if not exists slug text;

create unique index if not exists properties_slug_unique_idx
  on public.properties(slug)
  where slug is not null;

with property_rows(
  name,
  slug,
  address,
  house,
  apartment_type,
  floor_label,
  size_m2,
  source_url,
  description
) as (
  values
    (
      'Shangri-La Nadelhorn',
      'shangri-la-nadelhorn',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '3rd floor',
      80,
      'https://shangri-la-saas-fee.ch/wohnungen/nadelhorn/',
      'Nadelhorn is an 80 m2 3-room apartment on the 3rd floor. It has a large living room with fireplace, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Suedlenz',
      'shangri-la-suedlenz',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '2nd floor',
      80,
      'https://shangri-la-saas-fee.ch/wohnungen/suedlenz/',
      'Suedlenz is an 80 m2 3-room apartment on the 2nd floor. It has a large living room with wood-burning stove, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Weissmies',
      'shangri-la-weissmies',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '1st floor',
      80,
      'https://shangri-la-saas-fee.ch/wohnungen/weissmies/',
      'Weissmies is an 80 m2 3-room apartment on the 1st floor. It has a large living room with wood-burning stove, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Taeschhorn',
      'shangri-la-taeschhorn',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '2-room / 1-bedroom duplex apartment',
      '3rd floor',
      50,
      'https://shangri-la-saas-fee.ch/wohnungen/taeschhorn/',
      'Taeschhorn is a 50 m2 2-room duplex apartment on the 3rd floor. It has a living room with fireplace, open kitchen, bedroom, bathroom and south balcony with panoramic views.'
    ),
    (
      'Shangri-La Allalin',
      'shangri-la-allalin',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '2-room / 1-bedroom duplex apartment',
      '1st floor',
      50,
      'https://shangri-la-saas-fee.ch/wohnungen/allalin/',
      'Allalin is a 50 m2 2-room duplex apartment on the 1st floor. It has a living room with wood-burning stove, open kitchen, bedroom, bathroom and south balcony with panoramic views.'
    ),
    (
      'Shangri-La Alphubel',
      'shangri-la-alphubel',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '3rd floor',
      83,
      'https://shangri-la-saas-fee.ch/wohnungen/alphubel-3/',
      'Alphubel is an 83 m2 3-room apartment on the 3rd floor. It has a living room with wood-burning stove, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Strahlhorn',
      'shangri-la-strahlhorn',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '2nd floor',
      83,
      'https://shangri-la-saas-fee.ch/wohnungen/strahlhorn/',
      'Strahlhorn is an 83 m2 3-room apartment on the 2nd floor. It has a living room with wood-burning stove, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Fletschhorn',
      'shangri-la-fletschhorn',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '3-room / 2-bedroom apartment',
      '1st floor',
      83,
      'https://shangri-la-saas-fee.ch/wohnungen/fletschhorn/',
      'Fletschhorn is an 83 m2 3-room apartment on the 1st floor. It has a living room with wood-burning stove, open kitchen, 2 bedrooms, 2 bathrooms and south/east balconies with panoramic views.'
    ),
    (
      'Shangri-La Felskinn',
      'shangri-la-felskinn',
      'Shangri-La, 3906 Saas-Fee',
      'Shangri-La',
      '2-room / 1-bedroom apartment',
      'ground floor',
      47,
      'https://shangri-la-saas-fee.ch/wohnungen/felskinn/',
      'Felskinn is a 47 m2 2-room apartment on the ground floor. It has a living room with wood-burning stove, open kitchen, bedroom, bathroom and south/east balcony with panoramic views.'
    )
),
upserted_properties as (
  insert into public.properties (name, slug, address)
  select name, slug, address
  from property_rows
  on conflict (slug) where slug is not null
  do update set
    name = excluded.name,
    address = excluded.address
  returning id, name, slug
),
all_properties as (
  select
    u.id,
    u.name,
    u.slug,
    r.house,
    r.apartment_type,
    r.floor_label,
    r.size_m2,
    r.source_url,
    r.description
  from upserted_properties u
  join property_rows r on r.slug = u.slug
),
deleted_contacts as (
  delete from public.property_contacts c
  using all_properties p
  where c.property_id = p.id
  returning c.id
),
inserted_contacts as (
  insert into public.property_contacts (
    property_id,
    host_name,
    whatsapp,
    emergency_medical,
    police,
    fire,
    taxi
  )
  select
    id,
    'Barbara Wyssen / Gastgeberfamilie Andenmatten',
    null::text,
    '144',
    '117',
    '118',
    '+41 27 957 70 20'
  from all_properties
  returning id
),
instruction_rows as (
  select
    id as property_id,
    'overview' as category,
    'Apartment overview' as title,
    description || ' House: ' || house || '. Type: ' || apartment_type || '. Size: ' || size_m2::text || ' m2. Floor: ' || floor_label || '. Source: ' || source_url as content
  from all_properties
  union all
  select
    id,
    'location',
    'Location',
    'Shangri-La is described as central and quiet, directly at the edge of the ski piste, with open views of the surrounding four-thousand-metre peaks.'
  from all_properties
  union all
  select
    id,
    'equipment',
    'Apartment equipment',
    'The apartments are described with wooden floors and tiled bathrooms. Equipment includes Radio/CD, TV/DVD, free 24-hour WLAN Internet and a safe.'
  from all_properties
  union all
  select
    id,
    'wellness',
    'Wellness area',
    'Guests can use the house wellness area with whirlpool and sauna.'
  from all_properties
  union all
  select
    id,
    'ski',
    'Ski room and piste access',
    'The house is located directly at the edge of the ski piste and has a large ski room.'
  from all_properties
  union all
  select
    id,
    'access',
    'Elevator',
    'All apartments are described as reachable by elevator.'
  from all_properties
  union all
  select
    id,
    'contact',
    'Host contact',
    'Contact: Barbara Wyssen / Gastgeberfamilie Andenmatten. Email: shangri-la@saas-fee.ch. Booking page: https://booking.shangri-la-saas-fee.ch/?skd-language-code=de. A WhatsApp number is not available in the public source and should be added from internal property data if guests should contact the host via WhatsApp.'
  from all_properties
  union all
  select
    id,
    'internal_notes',
    'Missing private guest details',
    'Exact check-in instructions, key pickup, apartment Wi-Fi password and emergency host WhatsApp are not present in the public source. Add these from internal property documents before sharing this property chat with guests.'
  from all_properties
),
deleted_instructions as (
  delete from public.property_instructions i
  using all_properties p
  where i.property_id = p.id
    and i.category in (
      'overview',
      'location',
      'equipment',
      'wellness',
      'ski',
      'access',
      'contact',
      'internal_notes'
    )
  returning i.id
)
insert into public.property_instructions (property_id, category, title, content)
select property_id, category, title, content
from instruction_rows;
