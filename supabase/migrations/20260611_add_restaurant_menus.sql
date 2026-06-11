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

comment on table public.restaurant_menus is
  'Structured restaurant menu items, CHF prices and average check estimates for guest concierge answers.';
