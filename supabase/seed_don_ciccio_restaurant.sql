-- Ristorante Pizzeria DON CICCIO Saas-Fee restaurant and menu seed.
-- Source checked: 2026-06-19
-- Website: https://www.don-ciccio.ch/
-- Menu PDF: https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf
-- Dolci PDF: https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf
-- Drinks PDF: https://storage.e.jimdo.com/file/158b394c-33fe-4643-8bc0-ac564a65ea4f/Getra%CC%88nke%2024_25%20Winter.pdf
-- Wine PDF: https://storage.e.jimdo.com/file/dca67ce1-e021-414f-ab4e-39d33530d451/Weinkarte%2025%3A26.pdf
-- Grappa PDF: https://storage.e.jimdo.com/file/b39203a8-3baa-40bb-9a35-59ed886fd522/Grappa%2023%3A24%20Winter.pdf

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
  'Ristorante Pizzeria DON CICCIO',
  null,
  '+41 27 957 40 20',
  'donciccio@bluewin.ch',
  false,
  'Official website lists reservations by email until 16:00 and by phone 10:00-14:00 and 16:00-18:00. No verified WhatsApp reservation number is stored. Use phone +41 27 957 40 20 or email donciccio@bluewin.ch; do not send WhatsApp reservation requests unless a verified WhatsApp-enabled number is added later.',
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
      'Ristorante Pizzeria DON CICCIO Saas-Fee',
      'Ristorante Pizzeria DON CICCIO, Bielmattstrasse 6, 3906 Saas-Fee. Contact: +41 27 957 40 20, donciccio@bluewin.ch, website https://www.don-ciccio.ch/. Family Andrea & Ina Barbiero. The restaurant has been established since 2000 and describes itself as authentic and cosy Italian cuisine based on original recipes, freshness, quality and taste. It is on the main street and about 2 minutes on foot from the bus terminal. The restaurant is a good choice for pizza, pinsa, pasta, Italian fish/meat dishes, vegetarian options, gluten-free pasta and gluten-free pinsa. The website currently lists Betriebsferien 20.04.-13.06. and shows the kitchen as closed on all weekdays at the time checked. Reservation contact: email until 16:00, phone 10:00-14:00 and 16:00-18:00.'
    ),
    (
      'restaurants',
      'Ristorante Pizzeria DON CICCIO menu style',
      'Recommend DON CICCIO when guests ask for Italian food, pizza, pinsa, pasta, lasagne, risotto, gluten-free pasta, gluten-free pinsa, vegetarian Italian options, or a family-friendly restaurant near the bus terminal. Typical estimate from the current menu: pizzas CHF 19-35, pasta small/main CHF 19-36, mains CHF 42-54, desserts CHF 3.50-12. For reservations, give +41 27 957 40 20 or donciccio@bluewin.ch. Do not say a WhatsApp request was sent unless a verified WhatsApp number is added.'
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
where restaurant_name = 'Ristorante Pizzeria DON CICCIO';

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
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'average_check','Average check','Estimate from current PDFs: pizzas CHF 19-35, pasta CHF 19-36, meat/fish CHF 42-54, desserts CHF 3.50-12. A typical adult dinner with main dish and dessert or drink is usually around CHF 35-70.',null::numeric,'Approx. CHF 35-70 per adult, depending on pizza/pasta/meat choices and drinks',null,'https://www.don-ciccio.ch/','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'antipasti','Beef fillet carpaccio','Carpaccio from beef fillet with rocket salad, Parmesan and white truffle oil.',24,'CHF 24',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'antipasti','Tuna carpaccio','Tuna fillet carpaccio with lemon, pepper, onion marinade and sesame.',24,'CHF 24',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'antipasti','Composizione di Bufala','Smoked South Tyrolean ham, buffalo mozzarella, rocket salad, balsamic vinegar and Genovese pesto.',24,'CHF 24',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'antipasti','Focaccia della casa','House focaccia with dried tomatoes, rocket salad, garlic and Parmesan. Listed as a dish to share.',21,'CHF 21','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'salads','Insalata Caprese','Buffalo mozzarella, tomato and fresh basil.',20,'CHF 20','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'salads','Insalata mista','Mixed salad.',15,'CHF 15','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'salads','Insalata verde','Green salad.',9,'CHF 9','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'soups','Cream of tomato soup','Cream of tomato soup with basil and mozzarella.',14,'CHF 14','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'soups','Homemade pumpkin cream soup','Pumpkin cream soup with pumpkin seed oil, seeds and bread crouton.',14,'CHF 14','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Spaghetti aglio olio e peperoncini','Spaghetti with garlic, olive oil, pepperoncini and dried tomatoes.',null::numeric,'CHF 19 / CHF 22','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Bocconcini di bufala e ricotta tartufati ai Porcini','Ravioli stuffed with buffalo mozzarella and ricotta, truffled, with porcini cream sauce.',null::numeric,'CHF 29 / CHF 33','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Tagliolini with prawns and lobster tail','Tagliolini with king prawns, lobster tail and tomatoes.',null::numeric,'CHF 32 / CHF 36',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Tagliatelle with wild boar ragout','Tagliatelle with wild boar ragout.',null::numeric,'CHF 28 / CHF 32',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Homemade lasagne','Classic homemade lasagne.',null::numeric,'CHF 24 / CHF 28',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Prosecco risotto with porcini','Risotto with porcini, refined with Prosecco.',null::numeric,'CHF 24 / CHF 27','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pasta','Homemade gnocchi alla caponata','Homemade gnocchi with peppers and gorgonzola cream sauce.',null::numeric,'CHF 25 / CHF 28','vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'mains','Ossobuco alla milanese','Braised veal shank with saffron risotto.',46,'CHF 46',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'mains','Brasato with truffle risotto','Slow cooked beef with truffle risotto and spinach.',44,'CHF 44',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'mains','Beef tenderloin 180g','Beef tenderloin with rocket salad, rosemary, garlic and vegetables.',54,'CHF 54',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'mains','Mediterranean sea bass fillet','Grilled sea bass fillet with olive oil and vegetable variation.',51,'CHF 51',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'mains','King prawns with garlic','King prawns 8/12 with garlic and vegetable variation.',42,'CHF 42',null,'https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Originale','Pizza or pinsa with buffalo mozzarella, raw ham and rocket salad. Pinsa option + CHF 2.',35,'CHF 35','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','DOC','Pizza or pinsa with buffalo mozzarella, cherry tomatoes and basil. Pinsa option + CHF 2.',33,'CHF 33','pizza, vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Gustosa','Pizza or pinsa with aubergine, artichokes, courgette and cherry tomatoes. Pinsa option + CHF 2.',31,'CHF 31','pizza, vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Don Carlos','Pizza or pinsa with tuna, onions, capers and anchovy. Pinsa option + CHF 2.',27,'CHF 27','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Capricciosa','Pizza or pinsa with ham, mushrooms and artichokes. Pinsa option + CHF 2.',28,'CHF 28','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Calzone','Calzone with ham, mushrooms and egg.',30,'CHF 30','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','4 Stagioni','Pizza or pinsa with ham, mushrooms, artichokes and salami. Pinsa option + CHF 2.',31,'CHF 31','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Rustica','Pizza or pinsa with bacon, onions and capers marinade. Pinsa option + CHF 2.',24,'CHF 24','pizza','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Ai Porcini','Pizza or pinsa with porcini mushrooms and garlic. Pinsa option + CHF 2.',32,'CHF 32','pizza, vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','4 Formaggi','Pizza or pinsa with Gorgonzola, buffalo mozzarella, mozzarella and Taleggio. Pinsa option + CHF 2.',29,'CHF 29','pizza, vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Margherita','Pizza Margherita with tomato sauce and mozzarella. Pinsa option + CHF 2.',19,'CHF 19','pizza, vegetarian','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'pizza','Pizza and pinsa notes','Choose a base: pizza or pinsa. Pinsa costs + CHF 2. Gluten-free option available on request. Extra ingredients: simple toppings + CHF 1; premium toppings such as basil + CHF 5, buffalo mozzarella + CHF 6, raw ham + CHF 7.',null::numeric,'Pinsa + CHF 2; gluten-free on request; toppings from + CHF 1','pizza, gluten-free option','https://storage.e.jimdo.com/file/3f4be7ea-b574-4ab3-b200-58b43a22b3e9/Speisekarte%20Winter%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'desserts','Pannacotta with warm berries','Homemade pannacotta with warm berry sauce.',11,'CHF 11','dessert','https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'desserts','La Tartufata','Homemade chocolate truffle.',12,'CHF 12','dessert','https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'desserts','Tiramisu','Homemade tiramisu.',11,'CHF 11','dessert','https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'desserts','Gelati and sorbetti','Ice cream flavours include vanilla, caramel, pistachio, strawberry, stracciatella and chocolate. Sorbets include lemon, apricot, orange and mango. Whipped cream + CHF 1.',3.5,'CHF 3.50 per scoop; cream + CHF 1','dessert','https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'desserts','Sorbet coupe with alcohol','Examples: Colonel lemon sorbet with vodka, Albicocca apricot sorbet with Abricotine, Siciliana orange sorbet with Amacardo.',10,'CHF 10','dessert','https://storage.e.jimdo.com/file/420346f3-87bc-4040-9cfe-49cfaa79e180/Dolci%20Winter%2024%3A25.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'drinks','Aperitivi','Examples: Aperol Spritz CHF 12, Americano CHF 12, Prosecco 1 dl CHF 8, Martini CHF 8, Campari CHF 8.',null::numeric,'Aperitivi approx. CHF 7-12','drinks','https://storage.e.jimdo.com/file/158b394c-33fe-4643-8bc0-ac564a65ea4f/Getra%CC%88nke%2024_25%20Winter.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'drinks','Beer','Examples: Feldschlösschen draft 30 cl CHF 4.50 / 50 cl CHF 7, Moretti 33 cl CHF 5.50, Schneider Weisse 50 cl CHF 7.50, alcohol-free beer CHF 5-7.50.',null::numeric,'Beer approx. CHF 4.50-7.50','beer','https://storage.e.jimdo.com/file/158b394c-33fe-4643-8bc0-ac564a65ea4f/Getra%CC%88nke%2024_25%20Winter.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'drinks','Soft drinks and coffee','Examples: soft drinks 30 cl CHF 4.50 / 50 cl CHF 5.50, San Pellegrino or Aqua Panna 0.5 L CHF 5.50 / 1 L CHF 9, espresso CHF 4.50, cappuccino CHF 5.50.',null::numeric,'Soft drinks approx. CHF 4-9; coffee CHF 4.50-7','drinks','https://storage.e.jimdo.com/file/158b394c-33fe-4643-8bc0-ac564a65ea4f/Getra%CC%88nke%2024_25%20Winter.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'wine','Wine by the glass','Examples: Prosecco CHF 8, white wines CHF 8, rosé CHF 7, red wines approx. CHF 8-15.50, Moscato d’Asti CHF 7.50.',null::numeric,'Wine by glass approx. CHF 7-15.50','wine','https://storage.e.jimdo.com/file/dca67ce1-e021-414f-ab4e-39d33530d451/Weinkarte%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'wine','Italian wine bottles','Italian wine list includes Prosecco, Soave, Sauvignon, Ribolla Gialla, Chardonnay, Vermentino, Rosé, Barbera d’Alba, Langhe Nebbiolo, Barolo, Barbaresco and other Italian reds.',null::numeric,'Most bottles approx. CHF 46-99; selected bottles higher','wine','https://storage.e.jimdo.com/file/dca67ce1-e021-414f-ab4e-39d33530d451/Weinkarte%2025%3A26.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'grappa','Grappa selection','Examples include Nonino, Poli, Bosso and Antinori grappas. Prices range from Grappa di Moscato CHF 9 to Grappa Sassicaia CHF 17.',null::numeric,'Grappa approx. CHF 9-17','grappa','https://storage.e.jimdo.com/file/b39203a8-3baa-40bb-9a35-59ed886fd522/Grappa%2023%3A24%20Winter.pdf','2026-06-19'::date),
    ('Ristorante Pizzeria DON CICCIO','Bielmattstrasse 6, 3906 Saas-Fee','Italian, pizzeria, pasta, fish, meat, vegetarian, gluten-free options',35,70,'notes','Gluten-free and price notes','The website says Don Ciccio is a member of IG Zöliakie der Deutschen Schweiz and offers gluten-free pasta and gluten-free pinsa. Menu prices are in CHF and include 8.1% VAT.',null::numeric,'Gluten-free pasta and pinsa available; prices include 8.1% VAT','gluten-free option','https://www.don-ciccio.ch/infos/','2026-06-19'::date)
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
