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
      'restaurants',
      'Restaurants in Saas-Fee',
      'Saas-Fee has village restaurants, hotel restaurants, mountain restaurants and culinary trails. When guests ask where to eat, ask about budget, cuisine, party size and whether they want village dining or mountain views. Recommend checking current opening times and reservations on the official restaurant list: https://www.saas-fee.ch/en/culinary/restaurants'
    ),
    (
      'restaurants',
      'Mountain restaurants',
      'For meals with alpine views, suggest checking the official mountain restaurant list. Opening depends on season, lift status and weather, so guests should verify the same day before going up. Official page: https://www.saas-fee.ch/en/culinary/mountain-restaurants'
    ),
    (
      'restaurants',
      'Culinary trail',
      'The Saas-Fee/Saastal culinary trail is a food-focused route between selected restaurants and is useful for guests who want a relaxed tasting experience rather than one single restaurant. Current offers and booking details are on the official page: https://www.saas-fee.ch/en/culinary/culinary-trail'
    ),
    (
      'activities',
      'Summer activities',
      'Popular warm-season activities in Saas-Fee/Saastal include hiking, biking, climbing and mountaineering, gorge/alpine canyon experiences, glacier experience tours, trail running and summer skiing. For current activity options, use the official summer activities page: https://www.saas-fee.ch/en/summer-activities'
    ),
    (
      'activities',
      'Hiking',
      'Saas-Fee/Saastal offers about 350 km of hiking trails with routes from easy walks to high-alpine tours around the 4000 m peaks. Guests should check trail status, wear sturdy shoes and respect mountain trail difficulty. Official hiking page: https://www.saas-fee.ch/en/summer-activities/hiking'
    ),
    (
      'activities',
      'Biking',
      'Saas-Fee/Saastal has mountain bike and e-bike routes. Guests should check route status, lift transport rules and weather before starting. Official biking page: https://www.saas-fee.ch/en/summer-activities/biking'
    ),
    (
      'activities',
      'Climbing and mountaineering',
      'For climbing, mountaineering, glacier routes and high-alpine tours, guests should use qualified guides and check current conditions. Official climbing and mountaineering page: https://www.saas-fee.ch/en/summer-activities/climbing-mountaineering'
    ),
    (
      'activities',
      'Winter activities',
      'Popular winter activities include ski and snowboard, winter hiking, snowshoe hiking, glacier tours, cross-country skiing and sledging. For current winter options and booking links, use the official winter activities page: https://www.saas-fee.ch/en/winter-activities'
    ),
    (
      'mountain_cable_cars',
      'Open lifts and mountain cable cars',
      'Mountain lift status changes with weather, season and maintenance. For any question about whether a lift, cable car, gondola or mountain railway is open, tell guests to check the live official open-lifts page before travelling: https://www.saas-fee.ch/en/services-informationen/prices-timetables-cable-cars/timetables-cable-cars/open-lifts'
    ),
    (
      'mountain_cable_cars',
      'Cable car timetables',
      'For exact operating times, first and last uphill/downhill journeys, use the official cable car timetable page. Timetables vary by season and route: https://www.saas-fee.ch/en/services-informationen/prices-timetables-cable-cars/timetables-cable-cars'
    ),
    (
      'mountain_cable_cars',
      'SaastalCard',
      'In summer and autumn, the SaastalCard can include use of cable cars and PostBus in the Saas Valley from the first overnight stay, with Metro Alpin excluded. Guests should confirm current validity and included services on the official SaastalCard page: https://www.saas-fee.ch/en/planning-booking/saastalcard'
    ),
    (
      'weather',
      'Weather in Saas-Fee',
      'Mountain weather can change quickly. The chat may have a live weather snapshot, but guests should check the official Saas-Fee weather page and webcams before mountain activities: https://www.saas-fee.ch/en/weather and https://www.saas-fee.ch/en/webcams'
    ),
    (
      'weather',
      'Mountain safety and weather',
      'For hiking, biking, glacier tours, skiing or cable-car trips, advise guests to check weather, lift/trail status, wind and storm risk on the day itself. In poor visibility, storms, heavy rain, ice or strong wind, guests should choose village activities or ask the tourist office/guide office.'
    ),
    (
      'tourist_information',
      'Saas-Fee tourist office',
      'For official destination information, guests can contact Saastal Tourismus AG, Obere Dorfstrasse 2, CH-3906 Saas-Fee, phone +41 27 958 18 58, email info@saas-fee.ch. Official website: https://www.saas-fee.ch/en'
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
