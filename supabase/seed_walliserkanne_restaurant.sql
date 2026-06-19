-- Restaurant Walliserkanne, Hotel Allalin Saas-Fee restaurant and menu seed.
-- Source checked: 2026-06-19
-- Website: https://allalin.ch/dining/
-- Daily menu PDF: https://drive.google.com/file/d/1foucXQRMvQXPNnnfRkAhc3V80aTx1Rjw/preview
-- Seasonal menu PDF: https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview
-- Drinks menu PDF: https://drive.google.com/file/d/12bzv8Ck2B27EvMi1cwk2CFtbzd6Dl6R2/preview

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
  'Restaurant Walliserkanne',
  null,
  '+41 27 958 10 00',
  'info@allalin.ch',
  false,
  'Official contact from Hotel Allalin / Restaurant Walliserkanne. No verified WhatsApp reservation number is stored. For table requests, give phone +41 27 958 10 00 or email info@allalin.ch; do not send WhatsApp reservation requests unless a verified WhatsApp-enabled number is added later.',
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

with knowledge_rows(category, title, content) as (
  values
    (
      'restaurants',
      'Restaurant Walliserkanne Saas-Fee',
      'Restaurant Walliserkanne is the restaurant at Hotel Allalin, Lomattenstrasse 7, 3906 Saas-Fee. Contact: +41 27 958 10 00, info@allalin.ch, website https://allalin.ch/dining/. It is a cosy restaurant with candlelight and a distinctive interior surrounded by 350-year-old larch wood. The kitchen focuses on light, fresh cuisine, daily menus, à la carte dishes, Valais/Swiss dishes, fondue and a wine/drinks list. External guests can join the 5-course menu or à la carte menu with advance reservation. Opening hours listed by the website: winter 07:30-10:30 and 18:30-21:30; summer 07:30-14:00 and 18:30-21:00.'
    ),
    (
      'restaurants',
      'Restaurant Walliserkanne menu style',
      'Recommend Walliserkanne for guests who want a cosy hotel restaurant, candlelight dinner, Valais/Swiss cuisine, fondue, a 3-course or 5-course dinner menu, vegetarian pasta, beef, veal, perch, venison, children’s dishes, or a good wine list. Typical dinner estimate from current menus: CHF 45 for 3 courses, CHF 65 for 5 courses, or about CHF 35-75 per adult depending on à la carte choices and drinks. No verified WhatsApp reservation contact is stored; for reservations give +41 27 958 10 00 or info@allalin.ch.'
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
where restaurant_name = 'Restaurant Walliserkanne';

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
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'average_check','Average check','Estimate from the current daily and seasonal menus: 3-course dinner menu CHF 45, 5-course dinner menu CHF 65, many à la carte mains CHF 25-48, desserts CHF 4-10.',null::numeric,'Approx. CHF 35-75 per adult, depending on menu, à la carte choices and drinks',null,'https://allalin.ch/dining/','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'daily_menu','3-course dinner menu','Daily dinner menu for 19.06.2026.',45,'CHF 45','menu','https://drive.google.com/file/d/1foucXQRMvQXPNnnfRkAhc3V80aTx1Rjw/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'daily_menu','5-course dinner menu','Daily dinner menu for 19.06.2026.',65,'CHF 65','menu','https://drive.google.com/file/d/1foucXQRMvQXPNnnfRkAhc3V80aTx1Rjw/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'daily_menu','Beef fillet Stroganoff','Beef fillet Stroganoff with bell pepper and rice.',35,'CHF 35',null,'https://drive.google.com/file/d/1foucXQRMvQXPNnnfRkAhc3V80aTx1Rjw/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'daily_menu','Vegetable girasoli with herb cream sauce','Daily vegetarian pasta option: vegetable-stuffed girasoli with creamy herb sauce.',25,'CHF 25','vegetarian','https://drive.google.com/file/d/1foucXQRMvQXPNnnfRkAhc3V80aTx1Rjw/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'starters','Walliser plate','Selection of regional cold cuts and cheese.',null::numeric,'CHF 17 / CHF 28',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'starters','Vitello Tonnato','Sliced veal with tuna sauce.',null::numeric,'CHF 18 / CHF 28',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'starters','Caramelised goat cream cheese','Caramelised goat cream cheese on Valais rye bread with lamb’s lettuce, tomato confiture and nuts.',18,'CHF 18','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'starters','Sliced duck breast','Sliced duck breast with orange vinaigrette and roasted endive.',19,'CHF 19',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'soups','Daily cream soup','Soup of the day.',10,'CHF 10','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'soups','Clear soup of the day','Daily bouillon.',9,'CHF 9',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'soups','Chicken coconut soup','Chicken coconut soup with Chinese cabbage and chicken pieces.',11,'CHF 11',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Pan-fried beef sirloin steak','Pan-fried beef sirloin steak served with daily vegetables and choice of side/sauce.',39,'CHF 39',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Roasted corn-fed chicken breast','Roasted corn-fed chicken breast served with daily vegetables and choice of side/sauce.',32,'CHF 32',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','King prawns with lemon garlic butter','Fried king prawns with lemon garlic butter.',32,'CHF 32',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Venison filet medallions','Venison filet medallions with game sauce, spaetzli, red cabbage and red wine pear.',44,'CHF 44',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Regional perch fillets meunière','Fillets of perch meunière from the region with buttered rice, capers and dried tomatoes.',43,'CHF 43',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Sliced veal liver','Sliced veal liver with red wine vinegar sauce, mushrooms and fried butter rösti.',35,'CHF 35',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'mains','Veal strips Zurich style','Veal strips with mushrooms Zurich style, served with buttered rösti.',42,'CHF 42',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'pasta','Vegetable girasoli pasta','Vegetable girasoli pasta with herb cream sauce.',null::numeric,'CHF 18 / CHF 28','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'pasta','Pasta with tomato basil sauce','Pasta with tomato basil sauce.',22,'CHF 22','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'pasta','Pasta Bolognese','Pasta with Bolognese sauce.',25,'CHF 25',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'fondue','Valais cheese fondue','Cheese fondue Valais, served with bread cubes. Listed for 2 guests and contains alcohol.',28,'CHF 28 per person','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'fondue','Tomato fondue','Tomato fondue served with steamed potatoes. Listed for 2 guests and contains alcohol.',28,'CHF 28 per person','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'fondue','Cheese fondue with truffle cream','Cheese fondue with truffle cream, served with bread cubes. Listed for 2 guests and contains alcohol.',32,'CHF 32 per person','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'fondue','Fondue Chinoise','Meat fondue with 10 side dishes, rice or fries, beef, veal and pork 200g. Please order in advance.',48,'CHF 48 per person',null,'https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'children','Children pasta tomato sauce','Kids pasta with tomato sauce.',10,'CHF 10','children, vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'children','Fish crisps with fries','Fish crisps with vegetables and French fries.',12,'CHF 12','children','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'children','Chicken nuggets with fries','Chicken nuggets with French fries and vegetables.',14,'CHF 14','children','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'desserts','Tart of the day','Tart of the day, optionally with whipped cream.',null::numeric,'CHF 6 / CHF 7 with whipped cream','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'desserts','Dessert of the day','Daily dessert.',8,'CHF 8','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'desserts','Panna cotta with oranges','Panna cotta with oranges and winter spices.',10,'CHF 10','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'desserts','Plum crumble','Warm plum crumble with whipped cream.',10,'CHF 10','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'desserts','Mövenpick ice cream','Mövenpick ice cream, optional whipped cream.',null::numeric,'CHF 4 / CHF 5 with whipped cream','vegetarian','https://drive.google.com/file/d/1fWgupfwlu60PwhE5uf_Bor46ORE27tjr/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'drinks','House wines by the glass','Examples from the drinks menu: Fendant 1 dl CHF 4.50, Johannisberg 1 dl CHF 5.50, Dôle 1 dl CHF 4.50, Rosé de Goron 1 dl CHF 5.00.',null::numeric,'House wines by glass approx. CHF 4.50-5.50','wine','https://drive.google.com/file/d/12bzv8Ck2B27EvMi1cwk2CFtbzd6Dl6R2/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'drinks','Wine bottles','Wine list includes Valais white/red wines and international red wines. Examples: Fendant bottle CHF 43-45, Heida CHF 55, Petite Arvine CHF 54, Dôle de Salquenen CHF 46, Pinot Noir Les Tonneliers CHF 53, Cornalin Les Tonneliers CHF 59.',null::numeric,'Wine bottles mostly around CHF 43-72, selected bottles higher','wine','https://drive.google.com/file/d/12bzv8Ck2B27EvMi1cwk2CFtbzd6Dl6R2/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'drinks','Beer','Examples: Chopfab Draft 3.3 dl CHF 4.80, Appenzeller Quöllfrisch 5 dl CHF 7.00, Erdinger wheat beer 5 dl CHF 7.30, Clausthaler alcohol-free 3 dl CHF 4.80.',null::numeric,'Beer approx. CHF 4.80-7.30','beer','https://drive.google.com/file/d/12bzv8Ck2B27EvMi1cwk2CFtbzd6Dl6R2/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'drinks','Cocktails and long drinks','Examples: Hausapero CHF 11, Aperol Spritz CHF 11, Mimosa CHF 10, Hugo CHF 14, Negroni CHF 12, Gin Tonic CHF 12, Moscow Mule CHF 14.',null::numeric,'Cocktails and long drinks approx. CHF 10-17','cocktails','https://drive.google.com/file/d/12bzv8Ck2B27EvMi1cwk2CFtbzd6Dl6R2/preview','2026-06-19'::date),
    ('Restaurant Walliserkanne','Lomattenstrasse 7, 3906 Saas-Fee','Seasonal Swiss/Valais, international, vegetarian, fondue',35,75,'notes','Menu notes','Prices are in CHF and include VAT. The seasonal menu asks guests to contact the service team about allergies and intolerances. Meat/fish origins are listed in the PDF menu.',null::numeric,'All prices include VAT',null,'https://allalin.ch/dining/','2026-06-19'::date)
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
