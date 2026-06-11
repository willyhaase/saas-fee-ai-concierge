create extension if not exists pgcrypto;

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

create index if not exists restaurant_menus_active_restaurant_idx
  on public.restaurant_menus(is_active, restaurant_name);

create index if not exists restaurant_menus_category_idx
  on public.restaurant_menus(menu_category);

-- Replace the example rows below with exact prices from current restaurant menus.
-- Keep source_updated_at current so the chat can tell guests how fresh the prices are.
--
-- For average check only, use:
-- menu_category = 'average_check'
-- item_name = 'Average check'
-- price_chf = null
-- average_check_min_chf / average_check_max_chf = expected spend per person

with rows(
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
    (
      'Hannig',
      'Hannig, Saas-Fee',
      'Mountain restaurant, Swiss/alpine',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    ),
    (
      'Schäferstube',
      'Saas-Fee',
      'Traditional Valais/Swiss',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    ),
    (
      'Zer Schlucht',
      'Saas-Fee',
      'Regional mountain food',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    ),
    (
      'Brasserie 1809',
      'Saas-Fee',
      'Casual comfort food',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    ),
    (
      'The Capra',
      'Saas-Fee',
      'Hotel dining, wine cellar, fondue experience',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    ),
    (
      'Walliserhof',
      'Saas-Fee',
      'Hotel dining, Swiss/international',
      null::numeric,
      null::numeric,
      'average_check',
      'Average check',
      'Fill this row with the current expected spend per person from the latest menu.',
      null::numeric,
      null,
      null,
      null,
      null::date
    )
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
from rows
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

-- Example for adding exact menu items:
--
-- insert into public.restaurant_menus (
--   restaurant_name,
--   location,
--   cuisine,
--   average_check_min_chf,
--   average_check_max_chf,
--   menu_category,
--   item_name,
--   description,
--   price_chf,
--   price_text,
--   dietary_tags,
--   source_url,
--   source_updated_at
-- )
-- values
--   (
--     'Hannig',
--     'Hannig, Saas-Fee',
--     'Mountain restaurant, Swiss/alpine',
--     35,
--     55,
--     'main',
--     'Example dish name from menu',
--     'Example description from the current menu.',
--     28.50,
--     'CHF 28.50',
--     null,
--     'https://example.com/current-menu.pdf',
--     current_date
--   )
-- on conflict (restaurant_name, menu_category, item_name) do update set
--   average_check_min_chf = excluded.average_check_min_chf,
--   average_check_max_chf = excluded.average_check_max_chf,
--   description = excluded.description,
--   price_chf = excluded.price_chf,
--   price_text = excluded.price_text,
--   dietary_tags = excluded.dietary_tags,
--   source_url = excluded.source_url,
--   source_updated_at = excluded.source_updated_at,
--   is_active = true,
--   updated_at = now();
