-- Hotel Bristol Saas-Fee knowledge, offers, restaurant contact and confirmed prices.
-- Source checked: 2026-06-22
-- Website: https://www.hotel-bristol-saas-fee.ch/en/
-- Restaurant: https://www.hotel-bristol-saas-fee.ch/en/hotel-bristol/restaurant.html
-- Contact: https://www.hotel-bristol-saas-fee.ch/en/contact.html
-- Winter package: https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-winter/winter-packages-with-ski-pass.html
-- Summer offers:
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/yoga-hiking.html
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/bike-hike.html
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/wellbeing.html
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/summer-ski-on-glacier.html
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/summer-early-bird-saas-fee.html
--   https://www.hotel-bristol-saas-fee.ch/en/packages-1/packages-summer/golf-holiday-week.html

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

create index if not exists global_knowledge_active_idx
  on public.global_knowledge(is_active, category);

create index if not exists restaurant_menus_active_restaurant_idx
  on public.restaurant_menus(is_active, restaurant_name);

create index if not exists restaurant_menus_category_idx
  on public.restaurant_menus(menu_category);

insert into public.restaurant_contacts (
  restaurant_name,
  whatsapp_phone,
  phone,
  email,
  accepts_whatsapp_reservations,
  reservation_notes,
  is_active,
  updated_at
)
values (
  'Hotel Restaurant Bristol',
  null,
  '+41 27 958 12 12',
  'info@hotel-bristol-saas-fee.ch',
  false,
  'Official Bristol restaurant page lists table reservations by phone 027 958 12 12. No verified WhatsApp reservation number is stored. Use phone +41 27 958 12 12 or email info@hotel-bristol-saas-fee.ch; do not send WhatsApp reservation requests unless a verified WhatsApp-enabled number is added later.',
  true,
  now()
)
on conflict (restaurant_name) do update set
  phone = excluded.phone,
  email = excluded.email,
  whatsapp_phone = coalesce(nullif(public.restaurant_contacts.whatsapp_phone, ''), excluded.whatsapp_phone),
  accepts_whatsapp_reservations = case
    when public.restaurant_contacts.whatsapp_phone is not null
      and public.restaurant_contacts.whatsapp_phone <> ''
    then public.restaurant_contacts.accepts_whatsapp_reservations
    else false
  end,
  reservation_notes = case
    when public.restaurant_contacts.whatsapp_phone is not null
      and public.restaurant_contacts.whatsapp_phone <> ''
    then public.restaurant_contacts.reservation_notes
    else excluded.reservation_notes
  end,
  is_active = true,
  updated_at = now();

with rows(category, title, content) as (
  values
    (
      'hotels',
      'Hotel Bristol Saas-Fee overview',
      'Hotel Bristol Saas-Fee is a 3-star ski-in/ski-out yoga and sport hotel in Saas-Fee. Contact: Dorfstrasse 60, 3906 Saas-Fee, phone +41 27 958 12 12, fax +41 27 958 12 13, email info@hotel-bristol-saas-fee.ch, website https://www.hotel-bristol-saas-fee.ch/en/. The hotel is about 1 minute from the ski lifts and 2 minutes from cable cars, opposite the ski and snowboard meeting point, ice hockey and curling rink. Rooms are mostly south-facing with mountain/glacier views and balcony; single rooms are on the north side. Bedrooms are described as comfortable and renovated. Bristol is also known for its cuisine and selected wine list.'
    ),
    (
      'hotels',
      'Hotel Bristol Saas-Fee location and sports access',
      'Recommend Hotel Bristol for guests who ask for ski-in/ski-out, sport facilities, mountain access, family ski school convenience, or a hotel close to lifts. In winter, guests can ski back to the hotel and the area offers skiing from about 3600 m down to the village at 1800 m, with daily piste preparation, snowmaking on lower slopes, a snowpark and children learning areas. In summer, Bristol is opposite the Alpine golf course/driving range and close to sport, football, tennis, volleyball and basketball courts, mini-golf, cable cars, Feeblitz/toboggan train and hiking routes. Summer stays include Saas Valley cable cars and buses except Metro Alpin when this is included in the booked offer.'
    ),
    (
      'hotels',
      'Hotel Bristol Saas-Fee rooms and Bristolino apartment',
      'Hotel Bristol room types include single rooms, twin/double rooms, family suite for 2 adults plus children, panorama suite for families, and Apartment Bristolino. Room equipment commonly includes bath/shower, hairdryer, radio, flat screen TV, WiFi, direct dial phone and room safe. Twin rooms and suites are south-facing with balcony and glacier/mountain views. Family and panorama suites are intended for adults with children; children sleep free in the room arrangement and pay breakfast/dinner. Apartment Bristolino is a modern 92 m2 apartment beside the hotel for up to 6 people in 3 bedrooms, with open kitchen, lounge, terrace, WiFi, floor heating and ski room with ski boot heating; breakfast CHF 20 and 4-course dinner CHF 45 can be requested at the hotel. For exact live room prices and availability, guests should use Bristol direct booking or contact the hotel.'
    ),
    (
      'restaurants',
      'Hotel Restaurant Bristol Saas-Fee',
      'Hotel Restaurant Bristol is inside Hotel Bristol Saas-Fee, Dorfstrasse 60, 3906 Saas-Fee. Contact: +41 27 958 12 12, info@hotel-bristol-saas-fee.ch. Restaurant opening hours listed by the hotel: summer 11:30-13:30 and 18:30-20:30; winter 18:30-20:30. In winter Bristol offers Fondue Chinoise Buffet every Saturday. Hotel guests can book a 4-course dinner for CHF 45 per person. A small children’s menu is available. Reservations are by phone 027 958 12 12; no verified WhatsApp reservation contact is stored.'
    ),
    (
      'offers',
      'Hotel Bristol winter package with ski pass',
      'Hotel Bristol winter week package with ski pass includes 7 nights with breakfast buffet, 7 four-course dinners, 6-day ski pass, 10% discount at Glacier Sport, yoga lessons in the Yoga House, SaastalCard, free WiFi, free taxi on arrival/departure, ski boot dryer, glacier water welcome gift, departure gift, Ethno Health advice, doTERRA oils advice and My Walk training device rental. Published package prices per person: low season 28.11.2025-12.12.2025 and 03.01.2026-23.01.2026 CHF 1299; mid season 13.12.2025-19.12.2025 and 24.01.2026-06.02.2026 CHF 1433; high season 20.12.2025-26.12.2025 and 07.02.2026-19.04.2026 CHF 1555. Some last-minute/early-bird discounts may apply; confirm current availability with the hotel.'
    ),
    (
      'offers',
      'Hotel Bristol Yoga and Hiking week',
      'Hotel Bristol Yoga & Hiking Week is listed from CHF 688. It includes 7 overnight stays, 7 healthy breakfast buffets, 6 days free cable cars and PostBus in the Saas Valley except Metro Alpin, 2 yoga lessons, 1 Aqua Allalin wellness entrance, hiking trail recommendations, time to discover the mountains, and daily afternoon tea with fruits and nuts. It is a good recommendation for guests who want hiking, yoga, wellness and a calm summer mountain stay.'
    ),
    (
      'offers',
      'Hotel Bristol Bike and Hike week',
      'Hotel Bristol Bike & Hike Week is listed from CHF 808. It includes 7 overnight stays, 7 healthy breakfast buffets, 6 days free cable cars and PostBus in the Saas Valley except Metro Alpin, 1 Aqua Allalin wellness entrance, 1 guided bike tour, 50% off bike rental, 3 biker-energy packed lunches, tour map/advice, and a lockable bike room. Saas Valley has about 70 km of bike paths, so this offer is useful for active summer guests.'
    ),
    (
      'offers',
      'Hotel Bristol Wellbeing week',
      'Hotel Bristol Wellbeing Week with Ethno Health is listed from CHF 722. It focuses on healthy food, Ethno Health supplements, yoga and hiking. Included: 7 overnight stays, 7 healthy breakfast buffets, 6 days free cable cars and PostBus in the Saas Valley except Metro Alpin, 2 yoga lessons, Ethno Health products/information and 1 Aqua Allalin wellness entrance. Good for guests asking for wellness, gentle activity, health-focused travel or yoga.'
    ),
    (
      'offers',
      'Hotel Bristol summer ski on glacier',
      'Hotel Bristol Summer Ski on Glacier package is for skiing and snowboarding on the glacier from about mid-July to early November and includes ski pass. Published prices: 3 nights + 2 days ski pass CHF 377; 4 nights + 3 days CHF 511; 5 nights + 4 days CHF 655; 6 nights + 5 days CHF 777; 7 nights + 6 days CHF 899. End July to beginning September: plus CHF 10 per day/person. Includes breakfast buffet, cafe voucher for Bristol restaurant, transport from/to parking garage, 1 litre glacier water, 10% ski/shoe rental discount and free WiFi. Optional 4-course dinner CHF 45.'
    ),
    (
      'offers',
      'Hotel Bristol summer early bird and short stay',
      'Hotel Bristol Summer Early Bird / Last Minute / Short Stay offer applies in periods listed by the hotel such as mid-June to mid-July and end September to beginning November. It includes healthy breakfast buffet, cafe voucher for Bristol restaurant, 1 litre glacier water, SaastalCard/guest card, pickup/bring service to parking, 10% discount at Glacier Sport for summer ski equipment and free WiFi. Published per-person prices: 2 nights CHF 140, 3 nights CHF 210, 4 nights CHF 280, 5 nights CHF 350, 6 nights CHF 420, 7 nights CHF 490. Optional 4-course evening menu CHF 45 per person.'
    ),
    (
      'offers',
      'Hotel Bristol golf holiday information',
      'Hotel Bristol is directly by the Alpine Golf course/driving range in Saas-Fee. The hotel describes it as about 2 minutes from the hotel. The 9-hole Alpine golf course is open to all and can be played without Platzreife/handicap certification; it is not handicap-effective. Listed local golf prices: round CHF 30 including clubs; driving range/basket of golf balls CHF 10 including clubs. Recommend this to guests asking for golf, light sport, or activities close to Bristol.'
    )
),
deleted_knowledge as (
  delete from public.global_knowledge existing
  using rows
  where existing.category = rows.category
    and existing.title = rows.title
  returning existing.id
)
insert into public.global_knowledge (category, title, content, is_active, updated_at)
select category, title, content, true, now()
from rows;

update public.restaurant_menus
set is_active = false,
    updated_at = now()
where restaurant_name = 'Hotel Restaurant Bristol';

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
      'Hotel Restaurant Bristol',
      'Dorfstrasse 60, 3906 Saas-Fee',
      'Hotel restaurant, Swiss/Valais, 4-course dinner, Fondue Chinoise buffet in winter',
      45,
      70,
      'average_check',
      'Average check',
      'Confirmed hotel guest dinner price is CHF 45 for a 4-course dinner. For external guests or Saturday winter Fondue Chinoise Buffet, ask Bristol directly because the public page does not list all prices.',
      null::numeric,
      'Approx. CHF 45+ per adult, depending on menu and drinks',
      null,
      'https://www.hotel-bristol-saas-fee.ch/en/hotel-bristol/restaurant.html',
      '2026-06-22'::date
    ),
    (
      'Hotel Restaurant Bristol',
      'Dorfstrasse 60, 3906 Saas-Fee',
      'Hotel restaurant, Swiss/Valais, 4-course dinner, Fondue Chinoise buffet in winter',
      45,
      70,
      'dinner',
      '4-course dinner for hotel guests',
      'Four-course dinner offered to Hotel Bristol guests.',
      45,
      'CHF 45 per person',
      'hotel guest menu',
      'https://www.hotel-bristol-saas-fee.ch/en/hotel-bristol/restaurant.html',
      '2026-06-22'::date
    ),
    (
      'Hotel Restaurant Bristol',
      'Dorfstrasse 60, 3906 Saas-Fee',
      'Hotel restaurant, Swiss/Valais, 4-course dinner, Fondue Chinoise buffet in winter',
      45,
      70,
      'winter_special',
      'Fondue Chinoise Buffet',
      'Fondue Chinoise Buffet is offered every Saturday in winter. The public restaurant page does not list a price; guests should reserve by phone and ask for the current buffet price.',
      null::numeric,
      'Price not published on official page',
      'winter, fondue',
      'https://www.hotel-bristol-saas-fee.ch/en/hotel-bristol/restaurant.html',
      '2026-06-22'::date
    ),
    (
      'Hotel Restaurant Bristol',
      'Dorfstrasse 60, 3906 Saas-Fee',
      'Hotel restaurant, Swiss/Valais, 4-course dinner, Fondue Chinoise buffet in winter',
      45,
      70,
      'children',
      'Small children’s menu',
      'The hotel restaurant states that a small children’s menu is available. The public restaurant page does not list individual children’s dishes or prices.',
      null::numeric,
      'Price not published on official page',
      'children',
      'https://www.hotel-bristol-saas-fee.ch/en/hotel-bristol/restaurant.html',
      '2026-06-22'::date
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
