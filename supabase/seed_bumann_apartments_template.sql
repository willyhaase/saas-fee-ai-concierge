-- Seed template for Ferienwohnungen in Saas-Fee / Konstantin Bumann apartments.
-- Source: https://www.ferien-in-saas-fee.ch/en/holiday-homes/
--
-- Physical apartment list:
-- Aristella: 8, Belle-Vue: 5, Alpenglueck: 1.

create extension if not exists pgcrypto;

alter table public.properties
  add column if not exists slug text;

create unique index if not exists properties_slug_unique_idx
  on public.properties(slug)
  where slug is not null;

with property_rows(name, slug, address, house, apartment_type, occupancy, source_url, description) as (
  values
    (
      'Aristella Studio A',
      'aristella-studio-a',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      'Studio',
      '1-2 people',
      'https://www.ferien-in-saas-fee.ch/en/studio/',
      'Studio A in Aristella for 1-2 people. Aristella is in a peaceful, central location with mountain and glacier views.'
    ),
    (
      'Aristella 3-room',
      'aristella-3-room',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      '3-room apartment',
      '3-4 people',
      'https://www.ferien-in-saas-fee.ch/en/holiday-accommodation/',
      '3-room apartment in Aristella for 3-4 people.'
    ),
    (
      'Aristella Studio B',
      'aristella-studio-b',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      'Studio',
      '1-2 people',
      'https://www.ferien-in-saas-fee.ch/en/studio/',
      'Studio B in Aristella for 1-2 people.'
    ),
    (
      'Aristella 2.5-room A',
      'aristella-25-room-a',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      '2.5-room apartment',
      '2-4 people',
      'https://www.ferien-in-saas-fee.ch/en/low-cost-holiday-apartment/',
      '2.5-room apartment A in Aristella for 2-4 people.'
    ),
    (
      'Aristella 4-room',
      'aristella-4-room',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      '4-room apartment',
      '4-6 people',
      'https://www.ferien-in-saas-fee.ch/en/saas-valley-holiday-apartment/',
      '4-room apartment in Aristella for 4-6 people.'
    ),
    (
      'Aristella Studio C',
      'aristella-studio-c',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      'Studio',
      '1-2 people',
      'https://www.ferien-in-saas-fee.ch/en/studio/',
      'Studio C in Aristella for 1-2 people.'
    ),
    (
      'Aristella 2.5-room B',
      'aristella-25-room-b',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      '2.5-room apartment',
      '2-4 people',
      'https://www.ferien-in-saas-fee.ch/en/low-cost-holiday-apartment/',
      '2.5-room apartment B in Aristella for 2-4 people.'
    ),
    (
      'Aristella 6-room',
      'aristella-6-room',
      'Wildistr. 8, 3906 Saas-Fee',
      'Aristella',
      '6-room apartment',
      '8-10 people',
      'https://www.ferien-in-saas-fee.ch/en/family-holiday-apartment/',
      '6-room apartment in Aristella for 8-10 people.'
    ),
    (
      'Belle-Vue 4-room',
      'belle-vue-4-room',
      'Obere Wildistrasse, 3906 Saas-Fee',
      'Belle-Vue',
      '4-room apartment',
      '6-7 people',
      'https://www.ferien-in-saas-fee.ch/en/luxury-holiday-apartment/',
      '4-room apartment in Belle-Vue for 6-7 people. Belle-Vue adjoins Aristella on Obere Wildistrasse.'
    ),
    (
      'Belle-Vue 3.5-room A',
      'belle-vue-35-room-a',
      'Obere Wildistrasse, 3906 Saas-Fee',
      'Belle-Vue',
      '3.5-room apartment',
      '4-5 people',
      'https://www.ferien-in-saas-fee.ch/en/saas-fee-apartment/',
      '3.5-room apartment A in Belle-Vue for 4-5 people.'
    ),
    (
      'Belle-Vue 3.5-room B',
      'belle-vue-35-room-b',
      'Obere Wildistrasse, 3906 Saas-Fee',
      'Belle-Vue',
      '3.5-room apartment',
      '4-5 people',
      'https://www.ferien-in-saas-fee.ch/en/saas-fee-apartment/',
      '3.5-room apartment B in Belle-Vue for 4-5 people.'
    ),
    (
      'Belle-Vue 3.5-room Superior A',
      'belle-vue-35-room-superior-a',
      'Obere Wildistrasse, 3906 Saas-Fee',
      'Belle-Vue',
      '3.5-room apartment superior',
      '4 people',
      'https://www.ferien-in-saas-fee.ch/en/holidayapartment-saas-fee/',
      '3.5-room superior apartment A in Belle-Vue for 4 people.'
    ),
    (
      'Belle-Vue 3.5-room Superior B',
      'belle-vue-35-room-superior-b',
      'Obere Wildistrasse, 3906 Saas-Fee',
      'Belle-Vue',
      '3.5-room apartment superior',
      '4 people',
      'https://www.ferien-in-saas-fee.ch/en/holidayapartment-saas-fee/',
      '3.5-room superior apartment B in Belle-Vue for 4 people.'
    ),
    (
      'Alpenglueck 6.5-room',
      'alpenglueck-65-room',
      'Wildistr. 8, 3906 Saas-Fee',
      'Alpenglueck',
      '6.5-room apartment',
      '10-12 people',
      'https://www.ferien-in-saas-fee.ch/en/large-holiday-apartment/',
      '6.5-room apartment in Alpenglueck for 10-12 people, suitable for groups and families.'
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
  select p.id, p.name, p.slug, r.house, r.apartment_type, r.occupancy, r.source_url, r.description
  from public.properties p
  join property_rows r on r.slug = p.slug
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
    'Konstantin Bumann',
    '+41792527936',
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
    description || ' House: ' || house || '. Type: ' || apartment_type || '. Capacity: ' || occupancy || '. Source: ' || source_url as content
  from all_properties
  union all
  select
    id,
    'location',
    'Location and surroundings',
    'The holiday homes Alpenglueck, Aristella and Belle-Vue are in the sunny and quiet part of Saas-Fee, with mountain and glacier views. Bakery and grocery store are about 2-3 minutes on foot. Village centre, pharmacy, banks and shopping street are about 6-8 minutes on foot.'
  from all_properties
  union all
  select
    id,
    'ski',
    'Ski room and ski school access',
    'There is a private heated ski room. The ski slopes or ski school meeting point are described as about 2 minutes on foot from the homes.'
  from all_properties
  union all
  select
    id,
    'family',
    'Playground',
    'A private playground is located behind Hotel Belle-Vue. There is also a municipality playground within a short walking distance.'
  from all_properties
  union all
  select
    id,
    'contact',
    'Host contact',
    'Host: Konstantin Bumann. WhatsApp: +41 79 252 79 36. Email: info@ferien-in-saas-fee.ch.'
  from all_properties
),
deleted_instructions as (
  delete from public.property_instructions i
  using all_properties p
  where i.property_id = p.id
    and i.category in ('overview', 'location', 'ski', 'family', 'contact')
  returning i.id
)
insert into public.property_instructions (property_id, category, title, content)
select property_id, category, title, content
from instruction_rows;
