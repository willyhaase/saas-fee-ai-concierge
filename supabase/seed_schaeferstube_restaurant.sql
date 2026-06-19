-- Restaurant Schäferstube Saas-Fee website and menu seed.
-- Source checked: 2026-06-19
-- Website: https://www.schaeferstube.ch
-- PDF menu: https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf

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

update public.restaurant_contacts
set is_active = false,
    accepts_whatsapp_reservations = false,
    reservation_notes = 'Superseded by official Restaurant Schäferstube contact row.',
    updated_at = now()
where restaurant_name = 'Schäferstube';

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
  'Restaurant Schäferstube',
  null,
  '+41 27 957 25 37',
  'welcome@schaeferstube.ch',
  false,
  'Reservations are accepted by telephone only. Website says bookings/reservations are only taken by phone: +41 27 957 25 37. Do not send WhatsApp reservation requests for this restaurant unless a verified WhatsApp-enabled number is added later.',
  true,
  now()
)
on conflict (restaurant_name) do update set
  whatsapp_phone = null,
  phone = excluded.phone,
  email = excluded.email,
  accepts_whatsapp_reservations = false,
  reservation_notes = excluded.reservation_notes,
  is_active = true,
  updated_at = now();

with knowledge_rows(category, title, content) as (
  values
    (
      'restaurants',
      'Restaurant Schäferstube Saas-Fee',
      'Restaurant Schäferstube, Obere Gasse 32, 3906 Saas-Fee. Phone +41 27 957 25 37, email welcome@schaeferstube.ch, website https://www.schaeferstube.ch. Simone and Daniel describe the restaurant as grounded, honest cuisine with creativity and attention to detail. It is about 7 minutes on foot from the church square in Saas-Fee: from the church, take the road uphill on the left and follow the two wooden signposts. It can also be reached directly from the beginner ski slope Stafelwald. As of the website check on 2026-06-19, the restaurant is in between-season break and closed; summer start is listed as 03.07.2026. Reservations are accepted only by telephone. Dogs are not allowed inside the restaurant.'
    ),
    (
      'restaurants',
      'Restaurant Schäferstube menu and reservation style',
      'Use Restaurant Schäferstube for guests asking for cosy, creative Swiss/Valais cuisine, a sunny terrace, honest cooking, Cordon Bleu, lamb, beef tenderloin, fish, vegetarian beetroot main, desserts, or a restaurant above the village near Stafelwald. If asked to reserve, collect the details but explain that Schäferstube accepts reservations only by phone and give +41 27 957 25 37; do not say a WhatsApp request was sent.'
    ),
    (
      'restaurants',
      'Restaurant Schäferstube events',
      'Schäferstube can host events. Website details: sun terrace up to 80 seats, restaurant up to 60 seats. Arrival options are described as electric vehicle, horse carriage, helicopter, hot-air balloon, or simply on foot. Daniel can create a menu according to the guest’s taste. Contact by phone +41 27 957 25 37.'
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

update public.restaurant_menus
set is_active = false,
    updated_at = now()
where restaurant_name in ('Schäferstube', 'Restaurant Schäferstube');

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
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'average_check',
      'Average check',
      'Estimate from the current PDF menu: starters around CHF 15-29, main courses around CHF 34-56, desserts around CHF 8-21. A typical adult dinner with main dish and dessert or drink is usually around CHF 45-75.',
      null::numeric,
      'Approx. CHF 45-75 per adult, depending on starter/dessert and drinks',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Trüffelpommes',
      'Pommes/French fries with fresh Parmesan and truffle. Lunch additions are listed for 11:30-15:00.',
      null::numeric,
      'CHF 9 / CHF 17',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Smashed Cheese Burger',
      'Smashed cheese burger with beef, raclette cheese, chorizo and coleslaw.',
      29,
      'CHF 29',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Fish & Chips',
      'Crispy fish with mashed peas, French fries and homemade mayonnaise.',
      32,
      'CHF 32',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Homemade Rösti',
      'Homemade rösti with raclette cheese, ham, tomato and fried egg.',
      27,
      'CHF 27',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Schäfer’s Bratwurst',
      'Schäfer’s bratwurst with rösti and onion sauce.',
      28,
      'CHF 28',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'lunch_additions',
      'Schäfer’s Ravioli',
      'Ravioli with fresh mushrooms, tomatoes and truffle beurre blanc.',
      32,
      'CHF 32',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'starters',
      'Schäfer’s winter salad',
      'Green salad with pear, burrata, beets and seeds.',
      null::numeric,
      'CHF 17 / CHF 25',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'starters',
      'Caesar salad',
      'Lettuce with chicken breast, croutons and Parmesan.',
      null::numeric,
      'CHF 19 / CHF 29',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'starters',
      'Beef tatar 100g',
      'Beef tatar with truffles, blue potato, egg yolk and toast.',
      29,
      'CHF 29',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'starters',
      'Char nigiri',
      'Char nigiri with cucumber, wakame and black garlic.',
      25,
      'CHF 25',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'soups',
      'Cream of celery soup',
      'Cream of celery soup with lemongrass, pear and croutons.',
      15,
      'CHF 15',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'soups',
      'Lobster bisque',
      'Lobster bisque with saffron, root vegetables and gnocchi.',
      19,
      'CHF 19',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Cordon Bleu from local veal',
      'Cordon Bleu from local veal with French fries, vegetables and cranberries.',
      46,
      'CHF 46',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Lamb 2.0',
      'Pink and braised lamb with mustard crust, Jerusalem artichoke, leek and barley.',
      49,
      'CHF 49',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Beef tenderloin 180g',
      'Beef tenderloin with homemade truffle tagliolini, celery and braised onion.',
      56,
      'CHF 56',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Braised lamb shank',
      'Braised lamb shank with polenta, ratatouille and its sauce.',
      49,
      'CHF 49',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Sea bass and scallop',
      'Sea bass and scallop with pumpkin, barley arancini, apple and lobster bisque.',
      44,
      'CHF 44',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'mains',
      'Oven beetroot roasted',
      'Roasted oven beetroot with cauliflower mash, buckwheat and horseradish.',
      34,
      'CHF 34',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'sides',
      'French fries and spices',
      'Side dish.',
      8,
      'CHF 8',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'sides',
      'Truffle fries and Parmesan',
      'Side dish.',
      9,
      'CHF 9',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'sides',
      'Homemade truffle tagliolini',
      'Side dish.',
      11,
      'CHF 11',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'sides',
      'Winter vegetables and grains',
      'Side dish.',
      9,
      'CHF 9',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'sides',
      'Small green salad',
      'Side dish.',
      9,
      'CHF 9',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Homemade apple strudel',
      'Homemade apple strudel with hot vanilla sauce.',
      11,
      'CHF 11',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Homemade cake of the day',
      'Homemade cake of the day.',
      8,
      'CHF 8',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Valrhona chocolate cakes and mousse',
      'Valrhona chocolate cakes and mousse with mango-passion fruit, buckwheat and cucumber sorbet.',
      17,
      'CHF 17',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Apple tart',
      'Apple tart with homemade blackcurrant sorbet, white chocolate, lemon and Baileys.',
      15,
      'CHF 15',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Cheese from Jumi',
      'Cheese from Jumi with homemade chutney and bread.',
      21,
      'CHF 21',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'desserts',
      'Ice cream scoop',
      'Imperial ice cream scoop. Flavours: vanilla, chocolate, strawberry, espresso/mocca, mango, apricot. Whipped cream or chocolate sauce extra CHF 1.50 each.',
      4.5,
      'CHF 4.50 per scoop',
      'vegetarian',
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
    ),
    (
      'Restaurant Schäferstube',
      'Obere Gasse 32, 3906 Saas-Fee',
      'Creative Swiss/Valais cuisine, seasonal, regional',
      45,
      75,
      'notes',
      'Allergen and pricing notes',
      'All prices are in CHF and include VAT. The restaurant asks guests to communicate allergies or intolerances in advance. Extra cover or change of side dish is CHF 3.',
      null::numeric,
      'All prices include VAT; extra cover or side change CHF 3',
      null,
      'https://www.schaeferstube.ch/_files/ugd/34dc39_1b71e01d161e40e18a81aa2dcb2af472.pdf',
      '2026-06-19'::date
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
