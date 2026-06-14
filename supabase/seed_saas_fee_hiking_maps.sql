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

create index if not exists global_knowledge_active_idx
  on public.global_knowledge(is_active, category);

with rows(category, title, content) as (
  values
    (
      'hiking_maps',
      'Official Saas-Fee/Saastal hiking map',
      'Official source for hiking maps: Saas-Fee/Saastal Maps & Guides page, https://www.saas-fee.ch/en/about-the-holiday-region/maps. It lists the Interactive summer hiking map Saastal and other official destination maps. Use this when guests ask for a hiking map, walking route map, map of all trails, route overview, or visual overview of walking routes.'
    ),
    (
      'hiking_maps',
      'Saas-Fee hiking routes overview',
      'Official hiking overview page: https://www.saas-fee.ch/en/summer-activities/hiking. Saas-Fee/Saastal describes around 350 km of hiking trails, from relaxed walks to alpine routes around the 4000 m peaks. Use this page as the hiking route overview source and combine it with stored route recommendations from the summer 2026 map.'
    ),
    (
      'hiking_maps',
      'How to answer hiking map requests',
      'When guests ask for a map of all walking or hiking routes, provide the official Maps & Guides link and say that it contains the interactive summer hiking map for the Saas Valley. If they ask for a recommendation rather than a map, do not only send the map link: first ask about difficulty, duration, children/dog/stroller, lift use and weather, then suggest concrete routes from the stored hiking data.'
    ),
    (
      'hiking_maps',
      'Hiking status and safety',
      'Trail status can change because of snow, rain, rockfall, maintenance, wind or lift operation. For same-day hiking, tell guests to check the current trail and lift status before leaving. For high-alpine or white-blue-white routes, recommend mountain experience, proper shoes, weather check and turning back if conditions are unsafe.'
    )
),
deleted as (
  delete from public.global_knowledge existing
  using rows
  where existing.category = rows.category
    and existing.title = rows.title
  returning existing.id
)
insert into public.global_knowledge (category, title, content, is_active, updated_at)
select category, title, content, true, now()
from rows;
