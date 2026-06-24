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
      'banking',
      'Bank in Saas-Fee',
      'The bank in Saas-Fee is Raiffeisenbank Mischabel-Matterhorn / Erlebnisbank, Obere Dorfstrasse 65, 3906 Saas-Fee. It is useful for banking services, cash withdrawal information and currency exchange questions. Bank coordinates: Bankenclearing 80808, SWIFT-Code RAIFCH22. Contact phone: +41 27 955 19 00, email erlebnisbank@raiffeisen.ch.'
    ),
    (
      'banking',
      'ATM in Saas-Fee',
      'The Erlebnisbank/Raiffeisen ATM location in Saas-Fee is at the village square, Haus Nicoletta. For guests who only need cash, recommend the ATM first. Saas-Fee is car-free, so guests should walk through the village.'
    ),
    (
      'banking',
      'Erlebnisbank Saas-Fee opening hours',
      'Erlebnisbank/Raiffeisen Saas-Fee ordinary opening hours: Monday 08:30-11:30 and 14:30-17:30; Tuesday 08:30-11:30 and 14:30-17:30; Wednesday 08:30-11:30 and consulting afternoon; Thursday 08:30-11:30 and 14:30-17:30; Friday 08:30-11:30 and 14:30-17:30; Saturday and Sunday closed. Telephone and live online consultation are listed as 08:30-12:00 and 13:30-20:00.'
    ),
    (
      'banking',
      'How to get to Erlebnisbank from Obere Wildistrasse 31',
      'From the property area at Obere Wildistrasse 31, walk downhill toward the village centre and continue along Obere Dorfstrasse. Erlebnisbank/Raiffeisen Saas-Fee is at Obere Dorfstrasse 65, 3906 Saas-Fee. The walk is roughly 10 to 15 minutes depending on snow and walking pace.'
    ),
    (
      'banking',
      'Currency exchange in Saas-Fee',
      'For currency exchange, use Erlebnisbank/Raiffeisen Saas-Fee at Obere Dorfstrasse 65. Exchange rates can change, so answer with propertyContext.liveExchangeRates if current rates are available in chat. If liveExchangeRates has no rates, do not invent a rate; tell guests that the live rate is not available in chat right now and recommend confirming directly with the bank before exchanging cash.'
    ),
    (
      'transport',
      'Arrival in Saas-Fee by public transport',
      'For arrival by public transport, guests should travel by train to Visp and then take PostBus 511 in the direction of Saas-Fee. The PostBus runs directly from Visp to Saas-Fee/Saas Valley about every half hour. Public transport from Zurich, Geneva, Basel Euro Airport and Milan airports takes about three hours. For exact live times, guests should check SBB/PostAuto, but in chat answer the route clearly: train to Visp, then PostBus 511 to Saas-Fee.'
    ),
    (
      'transport',
      'Arrival in Saas-Fee by car',
      'For arrival by car, drive to Visp and then south towards Saas-Fee. After Stalden, at the Killerhof roundabout, take the second exit towards Saas-Fee. In Saas-Grund, turn right after the church towards Saas-Fee. From the north, travellers can use the Loetschberg car train between Kandersteg and Goppenstein; from the east the Furka Pass or Furka car transport; from the south the Simplon Pass or Simplon car transport; from the west drive via Lausanne along the Rhone valley to Visp. Saas-Fee is car-free, so guests park at the Saas-Fee car park/parking area and continue on foot, by hotel transfer or local electric taxi/service.'
    ),
    (
      'transport',
      'PostAuto winter local transport Saas-Fee/Saas Valley',
      'PostAuto operates winter local transport in the Saas-Fee/Saas Valley region with electric buses. Routes: 642 Bidermatten - Saas-Grund - Saas-Fee Busterminal - Alpin Express; 643 Saas-Almagell Sportplatz - Saas-Grund - Saas-Fee Busterminal - Alpin Express; 644 Saas-Fee Parkplatz Nord - Saas-Fee Busterminal - Alpin Express. The service helps guests reach the Alpin Express and ski area without changing at the village entrance. During the winter season until 19 April 2026, the buses run daily; the electric buses run every 15 minutes, and from Saas-Grund there can be 7.5-minute intervals because two routes serve the corridor.'
    ),
    (
      'transport',
      'Saas-Fee winter Ortsbus and Skibus',
      'The Saas-Fee Ortsbus/Skibus carries guests and locals free of charge to the ski areas and back during the winter season. The main winter route links the Wildi area, including obere Wildi and Grosses Moos, with the ski area and back. Normal winter operating pattern from the municipality: Sunday to Friday 08:30-17:30; Saturday 09:00-12:30 and 14:30-17:00. Fleet includes Allalino nostalgic train, Intersport bus, Raiffeisen bus and Energie bus. Contact for Orts- und Skibus: Dorfplatz 8, 3906 Saas-Fee, phone +41 27 958 11 70, email bernd.kalbermatten@3906.ch.'
    ),
    (
      'transport',
      'Saas-Fee shuttle bus winter 2025-26 lines',
      'Winter shuttle bus timetable 2025-26 runs from 20/21 December 2025 to 19 April 2026 depending on the line. Line 1 runs daily except Saturday between Felsenegg, Sunnmattu, Grosses Moos, Royal, Allalin, Central, Dorfplatz, Gletscherbruecke and Spielbodenbahn. Line 2 runs daily between Felsenegg, Sunnmattu, Grosses Moos, Royal, Allalin, Central, Dorfplatz, Gletscherbruecke, Spielbodenbahn and Alpin Express, with return service via Alpin Express, Spielbodenbahn, Gletscherbruecke, Dorfplatz, Central, Busterminal, Parkhaus, Allalin, Royal, Grosses Moos, Sunnmattu and Felsenegg. Line 3 runs daily between Alphitta, Etoile, Royal, Allalin, Central, Dorfplatz, Gletscherbruecke and Spielbodenbahn. Stops shown on the timetable include Spielbodenbahn, Gletscherbruecke, Alpin Express, Busterminal, Parkhaus, Parkplatz Nord, Felsenegg, Sunnmattu, Grosses Moos, Alphitta, Atlantic, Etoile, All Inn, Royal, Allalin, Central and Dorfplatz. Line 1 and Line 3 may be cancelled during heavy snowfall or when mountain railways are closed.'
    ),
    (
      'transport',
      'Summer and autumn village transport in Saas-Fee',
      'According to Saas-Fee/Saastal arrival information, there are no regular buses operating within the village of Saas-Fee during summer and autumn. For journeys within the village or to mountain railways, guests should use local taxi companies, hotel transfers or walk. The municipality also describes summer Allalino village tours: four village tours are usually operated, with information in German, French and English; prices listed by the municipality are CHF 6 per adult and CHF 4 per child.'
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
      'activities',
      'Sportplatz Kalbermatten sports grounds',
      'Saas-Fee has sports grounds at Sportplatz Kalbermatten, 3906 Saas-Fee. In summer the facilities include a football field with artificial turf, 90 x 50 metres, 6 tennis courts, volleyball, basketball, children playground, land hockey, golf driving range and skating park. In winter the facilities include a natural ice rink, curling with 4 rinks and Eisstockschiessen. Summer home games of FC Saas-Fee and TC Saas-Fee and winter home games of EHC Saastal are held there. For questions or reservations, guests should contact the Swiss Ski and Snowboard School Saas-Fee, phone +41 27 957 24 54, email info@skischule-saas-fee.ch. Map location supplied by property team: https://maps.app.goo.gl/DDrDUWemyfh5uhTY9. Important: if a guest asks whether Saas-Fee has a football field, answer yes and mention the artificial-turf football field at Sportplatz Kalbermatten.'
    ),
    (
      'activities',
      'Saas Valley experience worlds',
      'Use the Saas Valley Erlebniswelten as a structured way to recommend activities. The main worlds are: Allalin for summer skiing, world records, glacier views and first 4000 m ambitions; Längfluh for glacier trekking, glacier views and the glacier lake; Spielboden for marmots and family-friendly wildlife encounters; Hannig for sunny walking, animals and relaxed mountain time; Kreuzboden for families, a large playground, water games and Bike Skills Park; Hohsaas for mountain biking, adrenaline and big 4000 m views; Furggstalden and Heidbodmen for relaxation, sun and adventure paths; Mattmark for hiking and biking by the water and border hikes toward Italy. When guests ask what to do, pick the experience world that matches their mood instead of giving a generic list.'
    ),
    (
      'activities',
      'Experience world matching',
      'Match guests to activities like this: families with children -> Kreuzboden, Spielboden, Hannig; relaxed sunny mountain day -> Hannig or Furggstalden/Heidbodmen; glacier views or high-alpine wow factor -> Allalin or Längfluh; biking/adrenaline -> Hohsaas or Kreuzboden Bike Skills Park; water and quiet valley scenery -> Mattmark; wildlife -> Spielboden/Hannig; summer skiing -> Allalin. Mention opening dates only when known and relevant, because mountain areas depend on season and lift status.'
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
      'safety',
      'Fire ban in Valais',
      'ACHTUNG Feuerverbot! Es gilt ein Verbot von jeglichem Feuern im Freien mit sofortiger Wirkung für das gesamte Kantonsgebiet. Eine Entspannung der Lage ist erst nach einer intensiven Regenperiode von mindestens 3 Tagen zu erwarten. Kurze Regenschauer und Gewitter vermögen die gefährliche Situation nicht zu entschärfen. Die offiziellen Kontrollorgane werden jegliche Widerhandlungen den zuständigen Behörden anzeigen. Bei einem Brandausbruch handeln Sie nach dem Grundsatz: ALARMIEREN (118) - RETTEN - LÖSCHEN. When guests ask about BBQ, fire pits, outdoor fires, grilling in nature, campfires or mountain safety, clearly state that all outdoor fires are forbidden throughout the canton. Answer in the guest language, but keep the emergency principle and fire number 118 clear.'
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
