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

create table if not exists public.restaurant_menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null,
  location text,
  cuisine text,
  average_check_min_chf numeric(10, 2),
  average_check_max_chf numeric(10, 2),
  menu_category text not null,
  item_name text not null,
  description text,
  price_chf numeric(10, 2),
  price_text text,
  dietary_tags text,
  source_url text,
  source_updated_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_menus_unique_item unique (
    restaurant_name,
    menu_category,
    item_name
  )
);

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

create index if not exists global_knowledge_active_idx
  on public.global_knowledge(is_active, category);

create index if not exists restaurant_menus_active_restaurant_idx
  on public.restaurant_menus(is_active, restaurant_name);

create index if not exists restaurant_menus_category_idx
  on public.restaurant_menus(menu_category);

with knowledge_rows(category, title, content) as (
  values
    (
      'restaurants',
      'Restaurant Zur Mühle',
      'Restaurant Zur Mühle, Dorfstrasse 61, 3906 Saas-Fee. Contact: +41 27 957 26 76, info@zurmuehle-saas-fee.ch. WhatsApp for reservation requests: +41797531703. Recommend it for traditional, cosy Swiss/Valais dining, especially cheese fondue, meat fondue, rösti, Eringer beef dishes, beefsteak tartare prepared at the table, Chateaubriand and seasonal game from mid-September. Summer season 2026 is listed as 04.06.2026-25.10.2026. Opening hours listed by the restaurant: daily 09:30-23:30. Warm kitchen: winter 11:30-15:00 and 18:30-22:00; summer 11:30-14:30 and 17:30-22:00. Source: https://www.zurmuehle-saas-fee.ch/restaurant.html, checked 2026-06-12.'
    ),
    (
      'restaurants',
      'Zur Mühle recommendation style',
      'When guests ask for a traditional dinner, fondue, rösti, Eringer beef, tartare or a cosy village restaurant, Zur Mühle is a strong option. Mention address, phone and that it is known for cheese and meat fondues. If guests ask to reserve, create a reservation request via WhatsApp +41797531703; do not confirm the table until the restaurant confirms.'
    )
),
deleted_knowledge as (
  delete from public.global_knowledge existing
  using knowledge_rows
  where existing.category = knowledge_rows.category
    and existing.title = knowledge_rows.title
  returning existing.id
)
insert into public.global_knowledge (category, title, content, is_active, updated_at)
select category, title, content, true, now()
from knowledge_rows;

insert into public.restaurant_contacts (
  restaurant_name,
  whatsapp_phone,
  phone,
  email,
  accepts_whatsapp_reservations,
  reservation_notes,
  is_active
)
values (
  'Zur Mühle',
  '+41797531703',
  '+41 27 957 26 76',
  'info@zurmuehle-saas-fee.ch',
  true,
  'Reservation WhatsApp provided by project owner on 2026-06-12. Send only reservation requests; the table is confirmed only after the restaurant replies.',
  true
)
on conflict (restaurant_name) do update set
  whatsapp_phone = excluded.whatsapp_phone,
  phone = excluded.phone,
  email = excluded.email,
  accepts_whatsapp_reservations = excluded.accepts_whatsapp_reservations,
  reservation_notes = excluded.reservation_notes,
  is_active = true,
  updated_at = now();

with menu_rows(
  restaurant_name,
  location,
  cuisine,
  average_check_min_chf,
  average_check_max_chf,
  menu_category,
  item_name,
  description,
  price_chf,
  price_text,
  dietary_tags,
  source_url,
  source_updated_at
) as (
  values
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'average_check', 'Average check', 'Typical dinner estimate based on the published menu: salads and pasta are lower, many rösti and cheese dishes are CHF 23-42, meat and fondue dishes are often CHF 47-69 per person.', null::numeric, 'Approx. CHF 45-75 per adult for dinner, depending on fondue/meat choices and drinks', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'salads', 'Grüner Salat', 'Green salad.', 9, 'CHF 9', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'salads', 'Gemischter Salat', 'Mixed salad.', 14, 'CHF 14', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'salads', 'Saaser Bergsalat', 'Fresh leaf salad and ruccola with feta cheese.', 25, 'CHF 25 / half portion CHF 19', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'starters', 'Carpaccio vom heimischen Eringerrind', 'Local Eringer beef carpaccio with Belper Knollen and truffle vinaigrette.', 29, 'CHF 29', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'starters', 'Saaser Teller', 'Valais platter with dried meat, sliced cheese, Saas sausage and cured ham.', 33, 'CHF 33 / half portion CHF 23', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'cheese', 'Käsefondue', 'Classic cheese fondue.', 29, 'CHF 29 per person', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'cheese', 'Tomatenfondue', 'Tomato fondue.', 30, 'CHF 30 per person', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'cheese', 'Käsefondue mit Trüffeln und Champagner', 'Cheese fondue with truffles and Nicolas Feuillatte Brut champagne.', 40, 'CHF 40 per person', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'roesti', 'Zürchergeschnetzeltes mit Rösti', 'Sliced veal with mushroom cream sauce and golden rösti.', 42, 'CHF 42', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'roesti', 'Rösti-Stroganoff', 'Sliced local Eringer beef with Stroganoff sauce; vegetarian tofu version also listed.', 39, 'CHF 39 / vegetarian with tofu CHF 29', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'roesti', 'Metro-Rösti', 'Rösti with sliced calf liver and red wine sauce.', 34, 'CHF 34', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'roesti', 'Hirten-Rösti', 'Rösti with leaf salad, cherry tomatoes, Belper Knollen and fresh herbs.', 25, 'CHF 25', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'pasta_small_dishes', 'Spaghetti Zur Mühle', 'Spaghetti with dried meat and cured ham in tomato cream sauce, Belper Knollen and ruccola.', 26, 'CHF 26', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'mains', 'Beefsteak tartare', 'Prepared and refined at the table to the guest’s taste.', 47, 'CHF 47 / half portion CHF 32', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'mains', 'Cordon bleu', 'Veal schnitzel filled with ham and cheese, served with fries and vegetables.', 48, 'CHF 48', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'mains', 'Entrecote vom Eringerrind', 'Entrecôte from local Eringer cattle.', 49, 'CHF 49 for 200g / CHF 40 for 160g', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'mains', 'Black Angus Chateaubriand Fleur du Rhône', 'Chef’s recommendation for two or more people, served with Williams potatoes, vegetables and Béarnaise sauce.', 69, 'CHF 69 per person, from 2 persons', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'meat_fondue', 'Fondue Chinoise', 'Slices of beef and veal in a savoury broth; meat fondues are served with fruits, rice and fries.', 58, 'CHF 58 per person, from 2 persons', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'meat_fondue', 'Fondue Zur Mühle', 'Beef and veal slices with king prawns in red wine broth with shiitake mushrooms.', 62, 'CHF 62 per person, from 2 persons', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'children', 'Gamsteller', 'Breaded schnitzel with fries for children.', 16, 'CHF 16', null, 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date),
    ('Zur Mühle', 'Dorfstrasse 61, 3906 Saas-Fee', 'Traditional Valais/Swiss, fondue, rösti, Eringer beef', 45, 75, 'children', 'Mäusetopf', 'Children’s cheese fondue, from 2 children.', 14, 'CHF 14 per child', 'vegetarian', 'https://www.zurmuehle-saas-fee.ch/images/restaurant/karten/speisekarte.pdf', '2026-06-12'::date)
)
insert into public.restaurant_menus (
  restaurant_name,
  location,
  cuisine,
  average_check_min_chf,
  average_check_max_chf,
  menu_category,
  item_name,
  description,
  price_chf,
  price_text,
  dietary_tags,
  source_url,
  source_updated_at,
  is_active,
  updated_at
)
select
  restaurant_name,
  location,
  cuisine,
  average_check_min_chf,
  average_check_max_chf,
  menu_category,
  item_name,
  description,
  price_chf,
  price_text,
  dietary_tags,
  source_url,
  source_updated_at,
  true,
  now()
from menu_rows
on conflict (restaurant_name, menu_category, item_name) do update set
  location = excluded.location,
  cuisine = excluded.cuisine,
  average_check_min_chf = excluded.average_check_min_chf,
  average_check_max_chf = excluded.average_check_max_chf,
  description = excluded.description,
  price_chf = excluded.price_chf,
  price_text = excluded.price_text,
  dietary_tags = excluded.dietary_tags,
  source_url = excluded.source_url,
  source_updated_at = excluded.source_updated_at,
  is_active = true,
  updated_at = now();
