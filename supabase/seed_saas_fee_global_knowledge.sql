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
      'When guests ask where to eat in Saas-Fee, answer with concrete options. Good village choices: Schäferstube for a cosy traditional Valais/Swiss dinner in a wooden chalet atmosphere; Zer Schlucht for regional mountain food and gorge/forest views; Brasserie 1809 for relaxed comfort food such as pasta, burgers and rösti; The Capra wine cellar for a classic fondue experience; Walliserhof restaurants for a polished hotel dinner in the village centre. Ask about budget, cuisine, party size and whether they prefer a mountain view or village dinner.'
    ),
    (
      'restaurants',
      'Mountain restaurants',
      'For meals with alpine views, recommend Hannig first. Hannig is the main mountain restaurant to suggest by default: it is ideal for a sunny lunch, relaxed mountain atmosphere, village views and an easy recommendation for most guests. After Hannig, suggest alternatives only if useful: Allalin is the high panoramic revolving restaurant at Mittelallalin, best for a special lunch with big glacier views; Spielboden is a good mountain lunch stop near the Spielboden gondola; Morenia is convenient around the Felskinn/Alpin Express ski area and works well for skiers who want an easy piste-side meal; Längfluh is useful for glacier views when that sector is operating; Hohsaas, above Saas-Grund, is a strong option for guests exploring the wider Saas Valley. Mention that mountain restaurants depend on lift operation and weather, but do not send guests away unless they ask for live opening status.'
    ),
    (
      'restaurants',
      'Culinary trail',
      'The Saas-Fee/Saastal culinary trail is a food-focused route between selected restaurants and is useful for guests who want a relaxed tasting experience rather than one single restaurant. Present it as an experience idea: several stops, small tastings or drinks, and a scenic walk through the destination. If the guest asks for booking details, offer to provide the booking link.'
    ),
    (
      'restaurants',
      'Restaurant recommendation style',
      'Do not answer restaurant questions with only a link. Start with 3 to 5 suitable restaurants and a one-line reason for each. Then ask one short follow-up if needed, for example: "Do you prefer traditional Swiss, casual comfort food, fondue, or a mountain lunch?" Only mention checking opening times when timing matters, such as same-day mountain restaurants or late dinner.'
    ),
    (
      'groceries',
      'Grocery stores in Saas-Fee',
      'For groceries in Saas-Fee, recommend two main options. Coop, Obere Dorfstrasse, 3906 Saas-Fee: a convenient central supermarket for everyday groceries, fresh food, drinks and household basics. VDI Migros, Untere Dorfstrasse 41, 3906 Saas-Fee: another central supermarket, useful for everyday groceries and Swiss supermarket basics. Saas-Fee is car-free, so guests should walk through the village or use local electric taxi/service if they have heavy bags.'
    ),
    (
      'groceries',
      'How to get to Coop from Obere Wildistrasse 31',
      'From the property area at Obere Wildistrasse 31, walk downhill toward the village centre and Obere Dorfstrasse. Coop is on Obere Dorfstrasse in the central village area. The walk is roughly 10 to 15 minutes depending on snow, luggage and walking pace. For heavy shopping, recommend going with backpacks or asking a local electric taxi/service for transport, because private cars are not allowed inside Saas-Fee.'
    ),
    (
      'groceries',
      'How to get to Migros from Obere Wildistrasse 31',
      'From the property area at Obere Wildistrasse 31, walk downhill toward the village centre, then continue toward Untere Dorfstrasse. VDI Migros is at Untere Dorfstrasse 41, 3906 Saas-Fee. The walk is roughly 15 minutes depending on route, snow and bags. It is a good option if guests are already near the lower village or bus terminal side.'
    ),
    (
      'groceries',
      'Grocery recommendation style',
      'When guests ask where to buy food, answer directly with Coop and Migros, including addresses and walking guidance. Do not send only a map link. Suggest Coop first for the easiest central option from most village routes, and Migros as a second option on Untere Dorfstrasse. Mention that opening hours can vary by season and holidays only if timing matters.'
    ),
    (
      'pharmacy',
      'Pharmacy near Saas-Fee',
      'The pharmacy in Saas-Fee is Vallesia Apotheke GmbH, Obere Dorfstrasse 25, 3906 Saas-Fee. Recommend this pharmacy first for medicine, pharmacy advice and basic health needs in the village. For urgent medical issues, guests should not wait for regular pharmacy opening hours; use emergency number 144 for medical emergencies.'
    ),
    (
      'pharmacy',
      'How to get to Vallesia Apotheke from Obere Wildistrasse 31',
      'From the property area at Obere Wildistrasse 31, walk downhill toward the village centre and Obere Dorfstrasse. Vallesia Apotheke GmbH is at Obere Dorfstrasse 25, 3906 Saas-Fee. The walk is roughly 10 to 15 minutes depending on snow and walking pace. Saas-Fee is car-free, so guests should walk through the village or use a local electric taxi/service if needed.'
    ),
    (
      'activities',
      'Summer activities',
      'Popular warm-season activities in Saas-Fee/Saastal include hiking, biking, climbing and mountaineering, gorge/alpine canyon experiences, glacier experience tours, trail running and summer skiing. For an easy day, suggest a village walk plus a gentle hike or cable-car viewpoint. For active guests, suggest hiking, biking or a guided glacier experience. For families, suggest easier hikes, cable-car viewpoints and summer mountain experiences.'
    ),
    (
      'activities',
      'Hiking',
      'Saas-Fee/Saastal offers about 350 km of hiking trails with routes from easy walks to high-alpine tours around the 4000 m peaks. Good answer pattern: for relaxed hikers, suggest scenic village and forest walks or easier routes reached by cable car; for fit hikers, suggest panoramic trails and high routes; for experienced alpine hikers, explain that white-red-white and white-blue-white trails require sure-footedness, good shoes, weather awareness and mountain experience.'
    ),
    (
      'activities',
      'Biking',
      'Saas-Fee/Saastal has mountain bike and e-bike routes. For casual guests, suggest e-bike routes and valley rides. For sportier guests, suggest mountain bike routes with cable-car access where permitted. Remind guests to check weather, brakes, helmet, route difficulty and whether bikes are allowed on the intended lift.'
    ),
    (
      'activities',
      'Climbing and mountaineering',
      'For climbing, mountaineering, glacier routes and high-alpine tours, recommend qualified local guides. Good options to describe: guided glacier experience for first-timers; Allalinhorn as a classic guided 4000 m objective for fit guests; climbing and mountaineering routes for experienced guests only. Always mention equipment, acclimatisation and current conditions.'
    ),
    (
      'activities',
      'Winter activities',
      'Popular winter activities include ski and snowboard, winter hiking, snowshoe hiking, glacier tours, cross-country skiing and sledging. For non-skiers, suggest winter hiking, snowshoeing, sledging, village cafés and mountain viewpoints. For skiers, mention Saas-Fee glacier skiing and the wider Saas Valley ski areas. For adventure guests, suggest a guided glacier tour or canyon/gorge experience when available.'
    ),
    (
      'mountain_cable_cars',
      'Open lifts and mountain cable cars',
      'Key lift areas around Saas-Fee include Hannig, Alpin Express, Felskinn, Metro Alpin to Mittelallalin, Spielboden, Längfluh, Plattjen and the Hohsaas area above Saas-Grund. Explain destinations rather than sending a link: Hannig should be recommended first for a sunny mountain lunch, relaxed walks and village views; Mittelallalin/Allalin is best for high glacier views and the revolving restaurant; Spielboden is good for a mountain meal and views; Hohsaas is a wider Saas Valley viewpoint above Saas-Grund. Mountain lift status changes with weather, season and maintenance; only provide a live-status link if the guest asks whether a specific lift is open today.'
    ),
    (
      'mountain_cable_cars',
      'Cable car timetables',
      'Cable car timetables vary by season, route and weather. In chat, answer conceptually first: recommend leaving enough buffer for the last descent, checking the last downhill time before lunch or hiking, and choosing lower/village activities if wind or storms affect lifts. Provide official timetable links only when the guest asks for exact times or live status.'
    ),
    (
      'mountain_cable_cars',
      'SaastalCard',
      'In summer and autumn, the SaastalCard can include use of cable cars and PostBus in the Saas Valley from the first overnight stay, with Metro Alpin excluded. Guests should confirm current validity and included services on the official SaastalCard page: https://www.saas-fee.ch/en/planning-booking/saastalcard'
    ),
    (
      'weather',
      'Weather in Saas-Fee',
      'Mountain weather can change quickly. The chat receives a live weather snapshot when available; answer with the current temperature, condition, wind and short forecast from liveWeather. For planning, explain what the weather means: clear/calm is better for viewpoints and hiking; rain or storms favour village restaurants, cafés, museums and wellness; strong wind can affect lifts; fresh snow or ice changes hiking and driving conditions. Do not send a weather link unless the guest asks for webcams or official live status.'
    ),
    (
      'weather',
      'Mountain safety and weather',
      'For hiking, biking, glacier tours, skiing or cable-car trips, advise guests to check weather, lift/trail status, wind and storm risk on the day itself. In poor visibility, storms, heavy rain, ice or strong wind, guests should choose village activities or ask the tourist office/guide office.'
    ),
    (
      'tourist_information',
      'Saas-Fee tourist office',
      'For official destination information, guests can contact Saastal Tourismus AG, Obere Dorfstrasse 2, CH-3906 Saas-Fee, phone +41 27 958 18 58, email info@saas-fee.ch. Use this contact directly in chat when a guest needs tourist-office help.'
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
