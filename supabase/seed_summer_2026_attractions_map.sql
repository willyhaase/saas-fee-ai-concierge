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

create table if not exists public.local_events (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  location text not null,
  category text not null default 'event',
  title text not null,
  start_date date not null,
  end_date date,
  time_text text,
  venue text,
  description text not null,
  price text,
  registration text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists global_knowledge_active_idx
  on public.global_knowledge(is_active, category);

create index if not exists local_events_active_dates_idx
  on public.local_events(is_active, start_date, end_date);

with knowledge_rows(category, title, content) as (
  values
    (
      'summer_2026_map',
      'Attractions Map 2026 source',
      'Source: Saas-Fee/Saastal Attractions Map 2026 EN, PDF: https://cdn.saas-fee.ch/fileadmin/user_upload/documents/Broschueren/Karten/Erlebniskarte-Sommer-2026-EN.pdf. Use this source for summer/autumn 2026 activities, family attractions, hiking, biking, indoor options, parking and cable car prices. Details are subject to change; for exact live operating status use saas-fee.ch/offene-anlagen.'
    ),
    (
      'family',
      'Saas marmots',
      'Marmot experiences on the map: Marmots Spielboden, Marmot cable car, and Marmots Stafelwald. Marmot food and information: Tourist office Saas-Fee, +41 27 958 18 58, info@saas-fee.ch. Good family recommendation for children and wildlife lovers.'
    ),
    (
      'family',
      'Pit-Pat Saas-Almagell',
      'Pit-Pat is a mix of minigolf and billiards with 18 obstacle tables. Contact: Tourist office Saas-Almagell, +41 27 958 18 88. Season: beginning of May to mid-October.'
    ),
    (
      'family',
      'Adventure world Allalin',
      'Adventure world Allalin highlights: VirtuAllalin VR experience, Metro Alpin (highest metro in the world), and the revolving restaurant at 3,500 m (highest revolving restaurant in the world). Best for high-alpine views, glacier atmosphere and a weather-dependent wow excursion.'
    ),
    (
      'family',
      'Playgrounds',
      'Playground highlights from the map: Hannig, Kreuzboden, and Saas-Almagell village. For families with children, recommend Kreuzboden first for the biggest family setup, then Hannig for a sunny relaxed mountain day.'
    ),
    (
      'family',
      'Minigolf',
      'Minigolf options: Saas-Fee, contact Paul Gyger +41 79 220 77 92, season mid-June to mid-October. Saas-Almagell, contact +41 27 958 18 88, season beginning of May to mid-October.'
    ),
    (
      'family',
      'Small animal zoo',
      'Small animal zoo options: petting zoo on Kreuzboden, +41 27 958 15 80, info@hohsaas.ch; small animal zoo at Restaurant Bodmen, +41 27 957 20 75, info@waldhues-bodmen.ch.'
    ),
    (
      'family',
      'Theme trails',
      'Theme trails from the map: Animal Treasure Hunt Saas-Fee; Eddie and the mountain weather; Murmeli Trail Spielboden; Fairytale Trail; Mystery Trail. Good for families who want an easy walk with a story or game element.'
    ),
    (
      'family',
      'Foxtrail',
      'Foxtrail is an interactive scavenger hunt for teams, friends and families. Contacts: Tourist office Saas-Fee +41 27 958 18 58, info@saas-fee.ch; Hohsaas Info Centre +41 27 958 15 80, info@hohsaas.ch. Info: saas-fee.ch/foxtrail.'
    ),
    (
      'family',
      'Adventure Land Kreuzboden',
      'Adventure Land Kreuzboden includes playground, water play park, petting zoo, large air trampoline and crystal mine. Contact Bergbahnen Hohsaas AG, +41 27 958 15 80, info@hohsaas.ch, hohsaas.ch.'
    ),
    (
      'adventure',
      'Feeblitz summer toboggan run',
      'Feeblitz is the only summer toboggan run in Valais. Guests can ride up to 40 km/h. Season: mid-June to end of October. Contact: +41 27 957 31 11, rodel@feeblitz.ch, feeblitz.ch.'
    ),
    (
      'adventure',
      'Mountaincarts Hannig',
      'Mountaincarts Hannig: guests ride three-wheeled mountain carts from Hannig down toward Saas-Fee. Season: mid-June to mid-October. Contact Saastal Bergbahnen AG, +41 27 958 11 00, bergbahnen@saas-fee.ch.'
    ),
    (
      'adventure',
      'Mountain scooters',
      'Mountain scooters are available at Kreuzboden (Bergbahnen Hohsaas) and Saas-Almagell (Saastal Bergbahnen). Open according to cable car timetable; rental at the mountain station.'
    ),
    (
      'adventure',
      'Rope Park Adventure Forest',
      'Rope Park Adventure Forest is new on the 2026 map. Guests from age 4 can climb from tree to tree. Season: mid-June to end of October, closed in bad weather. Use Saas-Fee Guides for information.'
    ),
    (
      'adventure',
      'Mountain guide offices',
      'Mountain guide offices from the map: Saas-Fee Guides +41 27 957 44 64, saasfeeguides.com; Active Dreams +41 79 328 63 64, activedreams.ch; Guide Allalin +41 78 825 82 73, guideallalin.ch; Bergsportparadies Saastal +41 79 433 15 64, allalin4027.ch; Mischabel Guides +41 79 605 04 19, mischabelguides.ch.'
    ),
    (
      'adventure',
      'My first four-thousander',
      'My first four-thousander: mid-June to mid-October, daily on request, only with a mountain guide. Recommend this only for fit guests who want a serious guided high-alpine objective.'
    ),
    (
      'adventure',
      'Glacier Experience Tour',
      'Glacier Experience Tour: experience the Trift Glacier and Fee Glacier up close in the Saas Valley. Only with a mountain guide. Best for adventurous guests who want glacier terrain without doing an independent alpine route.'
    ),
    (
      'adventure',
      'Bouldering outdoor',
      'Bouldering areas from the map: Kapellenweg Sector Saas-Fee, Area Saas-Grund, and Boulder Town Saas-Almagell. More information: saas-fee.ch/bouldern.'
    ),
    (
      'adventure',
      'Via ferrata routes',
      'Via ferrata routes from the map: Mittaghorn difficulty K2-K3; Jegihorn difficulty K3-K4; Britannia difficulty K3-K4; Alpiner Jägerweg difficulty K2 only with a mountain guide; Via Ferrata del Lago difficulty K3.'
    ),
    (
      'adventure',
      'Gorge Alpine',
      'Gorge Alpine runs through the Fee Canyon from Saas-Fee to Saas-Grund using suspension bridges, ladders and steel cables. Accessible all year round. Only with a mountain guide.'
    ),
    (
      'adventure',
      'Fellbach Waterfall Saas-Balen',
      'Fellbach Waterfall is listed as a Saas-Balen attraction on the 2026 attractions map. Recommend it for guests exploring the lower Saas Valley or looking for a waterfall stop.'
    ),
    (
      'biking',
      'Bike parks and trails overview',
      'Bike facilities on the map: Bike Skills Park Kreuzboden and Pumptrack Saas-Grund. Bike transport possible on Kreuzboden, Hohsaas, Furggstalden and Hannig facilities. Bike maps are available at tourist offices. General bike info: saas-fee.ch/bike.'
    ),
    (
      'biking',
      'Kreuzboden Bike',
      'Kreuzboden Bike: Kreuzboden to Trift Flowtrail, Trift to Furwald 80 vertical meters, Furwald to Saas-Grund Singletrail. Difficulty moderate, duration about 1 hour.'
    ),
    (
      'biking',
      'Weissmies Bike',
      'Weissmies Bike: probably the most beautiful and challenging bike trail in the Saas Valley. Start Hohsaas, end Kreuzboden. Duration 30 minutes, difficulty difficult.'
    ),
    (
      'biking',
      'E-Bike-Tour Saas',
      'E-Bike-Tour Saas: start Saas-Balen, end Mattmark dam. Duration 2 hours, difficulty easy.'
    ),
    (
      'biking',
      'E-Bike-Tour Gletscherseewjini',
      'E-Bike-Tour Gletscherseewjini: Saas-Balen - Grüebusee - Saas-Balen. Duration 4.5 hours, difficulty difficult.'
    ),
    (
      'biking',
      'Mattmark Bike',
      'Mattmark Bike: route Saas-Almagell - Mattmark - Saas-Almagell. Duration 3 hours, difficulty moderate.'
    ),
    (
      'biking',
      'Saas-Balen Stalden Bike',
      'Saas-Balen - Stalden Bike route: Saas-Balen to Stalden. Duration 2 hours, difficulty moderate.'
    ),
    (
      'biking',
      'Biketrail Hannig',
      'Biketrail Hannig is marked new on the 2026 map. Route Hannig - Saas-Fee. Duration 40 minutes, difficulty moderate.'
    ),
    (
      'biking',
      'Bike and e-bike rental shops',
      'Bike rental shops from the map: SES Saas-Fee, Obere Dorfstrasse 36, +41 78 725 78 00, sessaasfee.ch; SAASIA-Bike, Saastalstrasse 303, Saas-Grund, +41 27 957 16 86, saasia-bike.ch; Hotel Olympia E-Bike rental, Furusandstrasse 7, Saas-Almagell, +41 27 957 16 76, welcome@hotel-olympia.ch; Kreuzboden bike rental on site with Saas-Fee Guides.'
    ),
    (
      'hiking',
      'Gspon High-Altitude Trail',
      'Gspon High-Altitude Trail: start Gspon, end Kreuzboden, duration about 5 hours.'
    ),
    (
      'hiking',
      'Ibex Trail',
      'Ibex Trail: start Hannig, end Saas-Fee, duration about 4 hours.'
    ),
    (
      'hiking',
      'Chamois Trail',
      'Chamois Trail: start Hannig, end Saas-Fee, duration about 2.5 hours.'
    ),
    (
      'hiking',
      'Grächen High-Altitude Trail',
      'Grächen High-Altitude Trail: start Saas-Fee, end Hannigalp, duration about 6 hours.'
    ),
    (
      'hiking',
      'Valley Trail Saas Eisten Stalden',
      'Valley Trail Saas - Eisten - Stalden: start Saas-Balen, end Stalden, duration about 4 hours.'
    ),
    (
      'hiking',
      'Monte Moro Pass',
      'Monte Moro Pass hike: spectacular hike from Mattmark to the Italian border. Route Mattmark - Monte Moro Pass - Mattmark. Duration about 5.5 hours.'
    ),
    (
      'hiking',
      'Saas-Almagell Adventure Trail',
      'Saas-Almagell Adventure Trail: suspension bridges and secured rock passages, good for hikers with a head for heights. Start Furggstalden, end Almagelleralp, duration about 1 hour 30 minutes.'
    ),
    (
      'hiking',
      'Almagell High-Altitude Trail',
      'Almagell High-Altitude Trail: start Kreuzboden, end Saas-Almagell, duration about 3.5 hours.'
    ),
    (
      'hiking',
      'Glacier Trail',
      'Glacier Trail: only for experienced hikers. Start Morenia, end Mattmark, duration about 5.5 hours.'
    ),
    (
      'hiking',
      'Bodmen Forest Trail',
      'Bodmen Forest Trail: start Saas-Fee, end Saas-Almagell, duration about 45 minutes.'
    ),
    (
      'hiking',
      '4,000-Meter Peaks Trail',
      '4,000-Meter Peaks Trail: mid-June to end of September according to Bergbahnen Hohsaas timetable. Contact +41 27 958 15 80, info@hohsaas.ch, hohsaas.ch.'
    ),
    (
      'hiking',
      'Historic Waterways Trails',
      'Historic Waterways Trails on the map: Suone Unnerwasser Saas-Fee and Rittmal Wasserleitu. Good for guests interested in local irrigation channels and cultural landscape.'
    ),
    (
      'hiking',
      'Wellness and Yoga Trail Kreuzboden',
      'Wellness and Yoga Trail Kreuzboden: relaxation and wellbeing trail in an alpine landscape with resting areas and yoga stations surrounded by mountain views.'
    ),
    (
      'outdoor',
      'Mattmark Reservoir',
      'Mattmark Reservoir is Europe’s largest earthen dam. Activities: info cinema, hiking, biking and history.'
    ),
    (
      'outdoor',
      'Sports grounds',
      'Sports grounds from the map: Saas-Fee Sports Ground +41 27 957 24 54; Saas-Almagell Sports Ground +41 27 958 18 88, info@saas-almagell.ch; Saas-Balen Sports Ground +41 27 957 13 91; Tennis court Saas-Grund +41 27 958 18 55, info@saas-grund.ch.'
    ),
    (
      'outdoor',
      'Boccia and pétanque',
      'Boccia / pétanque season June to mid-October. Locations: La Gorge Saas-Fee; Minigolf Saas-Almagell; Hotel Christiania Saas-Almagell; mountain restaurant Felskinn Saas-Fee; mountain restaurant Hannig Saas-Fee; Sports Ground Saas-Fee.'
    ),
    (
      'outdoor',
      'Vitaparcours Helsana Trail Nordic Walking',
      'Vitaparcours / Helsana Trail / Nordic-Walking season: June to October.'
    ),
    (
      'outdoor',
      'Summer skiing',
      'Summer skiing: 20 km of glacier ski runs. Season mid-July to end of October, depending on snow conditions. Contact Saastal Bergbahnen AG, +41 27 958 11 00, bergbahnen@saas-fee.ch.'
    ),
    (
      'outdoor',
      'Golf Saas-Fee',
      'Golf: 6-hole alpine golf course and driving range. Season end of June to mid-October. Location/contact: Sportplatz Saas-Fee, +41 27 957 24 54.'
    ),
    (
      'outdoor',
      'Kneipp facilities',
      'Kneipp facilities from the map: Bifig Saas-Fee, Kreuzboden Saas-Grund, Restaurant Furggstalden Saas-Almagell.'
    ),
    (
      'outdoor',
      'Hell-Chessi',
      'Hell-Chessi is a natural swimming pool with refreshing glacier water in Saas-Almagell.'
    ),
    (
      'indoor',
      'Yoga House Bristol',
      'Yoga House Bristol in Saas-Fee offers YIN, Hatha and Power Yoga sessions during holidays.'
    ),
    (
      'indoor',
      'Bouldering room Saas-Grund',
      'Bouldering room of Saas-Grund: indoor bouldering all year in a 120 m2 climbing area, suitable for different skill levels.'
    ),
    (
      'culture',
      'Museums',
      'Museums and culture locations: Saas Museum Saas-Fee; Sonnenhalde Cultural Center Saas-Grund; Agricultural Museum Saas-Almagell; Kreuzboden Technical Museum Saas-Grund. Opening times and info: saas-fee.ch/kultur.'
    ),
    (
      'culture',
      'Round Church Saas-Balen',
      'Round Church Saas-Balen is a late baroque church with unique architecture.'
    ),
    (
      'indoor',
      'Aqua Allalin',
      'Aqua Allalin: indoor swimming pool, wellness and fitness area. Open daily. Contact Aqua Allalin, +41 27 958 50 60, info@aqua-allalin.ch. Opening hours on map: indoor pool 10:00-21:00, wellness 10:00-21:30, fitness 08:00-21:30.'
    ),
    (
      'indoor',
      'Micro bowling',
      'Micro bowling options: Wellness & Spa Pirmin Zurbriggen, +41 27 957 23 01, wellnesshotel-zurbriggen.ch; Haus Lehnhof, Dorfstrasse 32, +41 27 957 10 52, info@hauslehnhof.ch. Good bad-weather activity.'
    ),
    (
      'wellness',
      'Day spa options',
      'Day Spa options: Wellness & Spa Pirmin Zurbriggen +41 27 957 23 01, wellnesshotel-zurbriggen.ch; The Capra +41 27 958 13 58, capra.ch; Walliserhof Grand-Hotel & Spa +41 27 958 19 00, walliserhof-saasfee.ch; Schweizerhof +41 27 958 75 75, schweizerhof-saasfee.ch.'
    ),
    (
      'fitness',
      'Crossfit',
      'Crossfit option: Walliserhof Grand-Hotel & Spa, +41 27 958 19 00, walliserhof-saasfee.ch.'
    ),
    (
      'experience_worlds',
      'High alpine worlds of adventures',
      'High alpine worlds of adventures: Allalin - Highlight; Längfluh - Glacier world; Spielboden - Home of the marmots; Hannig - Sunny mountain; Kreuzboden - Family mountain; Hohsaas - Adrenaline and view; Furggstalden and Heidbodme - Place to recover; Mattmark Dam - Place to recharge.'
    ),
    (
      'parking',
      'Parking Saas-Fee prices 2026',
      'Parking Saas-Fee prices from the 2026 map: up to 30 min free; up to 1 h CHF 3; up to 2 h CHF 4; up to 3 h CHF 5; up to 4 h CHF 6; up to 5 h CHF 9; up to 6 h CHF 12; up to 7 h CHF 13; up to 8 h CHF 14; up to 24 h CHF 15. SaastalCard same rates for first 24 h.'
    ),
    (
      'parking',
      'Parking Saas-Fee longer stay prices 2026',
      'Longer stay parking Saas-Fee from the 2026 map: standard rate from 2nd-7th day CHF 15 per day, 8th-14th day CHF 15 per day, from 15th day CHF 15 per day; with SaastalCard CHF 11.50 per day from 2nd-7th day, CHF 9.50 from 8th-14th day, CHF 8 from 15th day. 1 week CHF 105 standard / CHF 84 with SaastalCard. 2 weeks CHF 210 standard / CHF 150.50 with SaastalCard. Camper per day CHF 65 standard / CHF 30 with SaastalCard.'
    ),
    (
      'cable_car_prices',
      'Cable car prices Saas-Fee Allalin 2026',
      'Cable car prices summer/autumn 2026: Saas-Fee - Allalin adult one-way CHF 62, return CHF 83; children/half-fare/GA one-way CHF 31, return CHF 41.50; group adults one-way CHF 56, return CHF 75; group children one-way CHF 28, return CHF 37.'
    ),
    (
      'cable_car_prices',
      'Cable car prices Saas-Fee Felskinn Morenia Spielboden Längfluh Hannig 2026',
      'Cable car prices summer/autumn 2026: Saas-Fee-Felskinn adult CHF 35 one-way / CHF 55 return; Saas-Fee-Morenia CHF 27 / CHF 42; Saas-Fee-Spielboden CHF 33 / CHF 50; Saas-Fee-Längfluh CHF 40 / CHF 61; Spielboden-Längfluh CHF 18 / CHF 25; Saas-Fee-Hannig CHF 30 / CHF 46. Children/half-fare/GA are about half price; group rates available.'
    ),
    (
      'cable_car_prices',
      'Cable car prices Saas-Grund and Saas-Almagell 2026',
      'Cable car prices summer/autumn 2026: Saas-Grund-Kreuzboden adult CHF 30 one-way / CHF 39 return; Saas-Grund-Hohsaas CHF 37 / CHF 48; Kreuzboden-Hohsaas CHF 30 / CHF 39; Saas-Almagell-Furggstalden CHF 12 / CHF 16; Saas-Almagell-Heidbodme CHF 22 / CHF 32; Furggstalden-Heidbodme CHF 15 / CHF 19; Saas-Almagell-Heidbodme-Furggstalden return CHF 26.'
    ),
    (
      'bike_prices',
      'Bike ticket prices Saas-Fee Saas-Grund Saas-Almagell 2026',
      'Bike tickets 2026 from the map: Saas-Fee Hannig single trip adult CHF 35, teenager CHF 35, child CHF 20, bike without passenger CHF 5; Hannig day ticket adult CHF 50, teenager CHF 50, child CHF 30, bike without passenger CHF 12. Saas-Grund 1 day adult CHF 48, teenager CHF 39, child CHF 24, bike without passenger CHF 15; afternoon 13:00-16:15 adult CHF 38, teenager CHF 31, child CHF 19; 4 days flex adult CHF 175, teenager CHF 143, child CHF 88; sunset from 15:45 CHF 15 passenger, bike CHF 10; season summer CHF 230 passenger, bike CHF 80. Saas-Almagell-Furggstalden bike transport CHF 17 adult/teenager, CHF 11 child, CHF 5 bike without passenger; downhill or e-bikes not transported.'
    ),
    (
      'cable_car_timetable',
      'Cable car timetable Saas-Fee summer autumn 2026',
      'Saas-Fee timetable from 2026 map: Spielboden 13.06-18.10.26, 09:00-16:15. Längfluh 20.06-27.09.26, 09:00-16:15. Hannig 14-17.05.26 and 23-25.05.26 09:00-16:30; 04.06-25.10.26 09:00-16:30. Felskinn 20.06-17.07.26 07:00-16:15. Metro Alpin 20.06-30.08.26 07:15-15:30; 31.08-13.09.26 07:45-15:30; 14.09-05.10.26 08:15-15:30; 06.10-31.10.26 08:45-15:30. Alpin Express 18.07-30.08.26 07:00-16:00; 31.08-13.09.26 07:30-16:00; 14.09-05.10.26 08:00-16:00; 06.10-31.10.26 08:30-16:00. Summer ski times progress from 07:00-12:00 to 08:30-15:00 by season period.'
    ),
    (
      'cable_car_timetable',
      'Cable car timetable Saas-Grund summer autumn 2026',
      'Saas-Grund timetable from 2026 map: Kreuzboden 23-25.05.26 08:00-16:30; 30.05-19.06.26 08:00-16:30; 20.06-30.08.26 07:30-16:45; 31.08-25.10.26 08:00-16:30. Mittelstation Trift 23-25.05, 30.05-19.06, 20.06-30.08, 31.08-25.10 all 10:15-16:15. Hohsaas 23-25.05.26 08:15-16:15; 30.05-19.06.26 08:15-16:15; 20.06-30.08.26 07:45-16:15; 31.08-27.09.26 08:15-16:15.'
    ),
    (
      'transport',
      'PostBus summer autumn 2026',
      'The latest PostBus timetable is available at postauto.ch/fahrplan. Map note: timetables cannot be guaranteed exactly; for most current information use saas-fee.ch and official PostBus timetable.'
    ),
    (
      'saastalcard',
      'SaastalCard notes from 2026 map',
      'Children under 6 travel free of charge. Cable car discounts: Swiss Travel Pass, Half-Fare Card, GA Travel Card and Junior Card are accepted; discount cards must be shown and discounts are not cumulative. Group discount for groups of 20 or more, paid and collected by one person. Metro Plus Ticket: pedestrians pay one-off CHF 50, children CHF 40, no HT/GA discount, and can use Metro Alpin without restriction during the stay, VirtuAllalin included; only available with SaastalCard.'
    ),
    (
      'dogs',
      'Dog transport cable cars 2026',
      'Dog transport notes from the map: Bergbahnen Hohsaas in Saas-Grund: dogs over 30 cm pay CHF 5, weekly and season dog tickets available at ticket office. Saastal Bergbahnen in Saas-Fee and Saas-Almagell: dogs over 30 cm pay a quarter of the adult rate; season and annual passes for dogs available at ticket offices.'
    ),
    (
      'emergency',
      'Important telephone numbers from 2026 map',
      'Important numbers: General emergency 112; Fire brigade 118; Police 117; Ambulance/air rescue 144; Saas-Fee doctor +41 27 957 58 59; Saas-Grund doctor +41 27 957 11 55; Dentist Saas-Grund +41 27 957 30 60; timetable information bus/train +41 90 030 03 00; Regional police +41 27 958 11 61; Saastal Bergbahnen rescue service only during ski season +41 27 958 11 11.'
    ),
    (
      'tourist_information',
      'Tourist and village contacts from 2026 map',
      'Tourist contacts from the map: Saas-Fee Tourist Information Centre +41 27 958 18 58; Hohsaas Info Centre +41 27 958 15 80; Saas-Almagell Service Centre +41 27 958 18 88; Village shop Saas-Balen +41 27 957 24 56; Eisterstübli Info Eisten +41 27 952 10 20. EchoSOS app is recommended.'
    ),
    (
      'mountain_restaurants',
      'Mountain restaurants and huts contacts Saas-Fee',
      'Saas-Fee mountain restaurants/huts from map: Alpenblick 2030 m, +41 76 539 32 78, info@alpenblick-saasfee.ch, alpenblick-saasfee.ch; Britanniahütte SAC 3030 m, +41 27 957 22 88, hello@britannia.ch, britannia.ch; Drehrestaurant Allalin 3500 m, drehrestaurant@saas-fee.ch; Felskinn 3000 m, +41 79 231 27 58, bf3000.saas-fee@gmx.ch, felskinn-saasfee.ch; Gletschergrotte 1998 m, +41 27 957 21 60, info@gletschergrotte.ch, gletschergrotte.ch; Hannig 2336 m, +41 27 957 14 19, info@bergrestaurant-hannig.ch; Mischabelhütte 3340 m, +41 27 957 13 17, mischabelhuette@gmx.ch, mischabelhuette.ch; Längfluh 2870 m, +41 77 420 74 54, info@langfluh-saasfee.ch, langfluh-saasfee.ch; Spielboden 2448 m, +41 77 291 49 21, spielboden@saas-fee.ch, spielboden.ch.'
    ),
    (
      'mountain_restaurants',
      'Mountain restaurants and huts contacts Saas-Grund and Saas-Almagell',
      'Saas-Grund/Saas-Almagell mountain restaurants/huts from map: Hohsaas 3140 m, +41 27 957 17 08, info@hohsaashuette.ch, hohsaashuette.ch; Kreuzboden 2398 m, +41 27 957 29 45, bergrestaurant-kreuzboden@gmx.ch; Weissmieshütte SAC 2726 m, +41 27 957 25 54, huette@weissmieshuette.ch, weissmieshuette.ch; Alpina 1885 m, +41 27 957 24 43, info@bergrestaurant-alpina.ch, bergrestaurant-alpina.ch; Almagelleralp 2194 m, +41 79 629 78 08, almagelleralp.com; Almagellerhütte 2894 m, +41 27 957 11 79, info@almagellerhuette.ch, almagellerhuette.ch; Furggstalden 1855 m, +41 27 957 55 55; Heidbodmen 2320 m, +41 79 174 02 20, olapawelczak@yahoo.de.'
    ),
    (
      'digital_tools',
      'Saas-Fee Saastal Guide and live status',
      'Saas-Fee/Saastal Guide web app includes weather, resort status, webcams, tariffs, cable car timetables, hikes, open restaurants and event calendar: saas-fee.ch/guide. Live sports and facilities report: saas-fee.ch/offene-anlagen. Webcams: saas-fee.ch/webcam. Event calendar: saas-fee.ch/veranstaltungskalender.'
    )
),
deleted_knowledge as (
  delete from public.global_knowledge existing
  using knowledge_rows rows
  where existing.category = rows.category
    and existing.title = rows.title
  returning existing.id
),
inserted_knowledge as (
  insert into public.global_knowledge (category, title, content, is_active, updated_at)
  select category, title, content, true, now()
  from knowledge_rows
  returning id
),
event_rows(
  source_key,
  location,
  category,
  title,
  start_date,
  end_date,
  time_text,
  venue,
  description,
  price,
  registration,
  source_url
) as (
  values
    (
      'summer-map-2026-suono-beer-hike',
      'Saas Valley',
      'culinary_event',
      'Suono Beer Hike',
      '2026-06-20'::date,
      '2026-06-20'::date,
      null,
      'Historic Suono water channels',
      'Relaxed culinary hike along the historic Suono water channels with 7 gourmet tasting stations, Valais and Swiss beers, and mountain panorama.',
      null,
      null,
      'https://saas-fee.ch/suone'
    ),
    (
      'summer-map-2026-saas-gourmet-trail',
      'Saas Valley',
      'culinary_event',
      'Saas Gourmet Trail',
      '2026-07-04'::date,
      '2026-07-04'::date,
      null,
      'Saas Valley',
      'Culinary mountain summer experience created by top chefs and sommeliers, combining nature, indulgence and hiking.',
      null,
      null,
      'https://saas-fee.ch/gourmet-trail'
    ),
    (
      'summer-map-2026-swiss-national-day',
      'Saas Valley',
      'event',
      'Swiss National Day',
      '2026-07-31'::date,
      '2026-08-01'::date,
      null,
      'Saas-Balen, Saas-Grund, Saas-Almagell and Saas-Fee',
      'Swiss National Day celebrations with aperitifs, music, folk dances, speeches and parades. Each village in the Saas Valley holds its own events highlighting local customs and community spirit.',
      null,
      null,
      'https://saas-fee.ch/nationalfeiertag'
    ),
    (
      'summer-map-2026-valais-yodellers-gathering',
      'Saas-Balen',
      'event',
      '65th Valais Yodellers Gathering and 60th Anniversary',
      '2026-08-21'::date,
      '2026-08-22'::date,
      null,
      'Saas-Balen / Grubenalp',
      'Two days of Valais tradition and music. On 21 August, Grubenalp Saas-Balen Yodelling Club celebrates its 60th anniversary with regional yodelling clubs and Stromstossörgeler. On 22 August, the 65th Valais Yodellers Gathering includes yodellers mass and festive finale with Moräneörgeler.',
      null,
      null,
      'https://saas-fee.ch/alphorntreffen'
    ),
    (
      'summer-map-2026-nostalgic-culinary-mile',
      'Saas-Fee',
      'culinary_event',
      'Nostalgic Culinary Mile',
      '2026-09-06'::date,
      '2026-09-06'::date,
      null,
      'Village street, Saas-Fee',
      'Nostalgic culinary mile along the village street with traditional menus and fine Valais wines, presenting life and food from the old days.',
      null,
      null,
      'https://saas-fee.ch/genussmeile'
    ),
    (
      'summer-map-2026-mattmark-memorial',
      'Saas-Almagell',
      'sport_event',
      'Mattmark Memorial 50K / 30K / 21K / 8K',
      '2026-09-12'::date,
      '2026-09-12'::date,
      null,
      'Mattmark / Saas Valley',
      '8th Mattmark Memorial with four routes: 21K half marathon through the Saas Valley, 8K lake circuit, and alpine trails over 30K and 50K.',
      null,
      null,
      'https://saas-fee.ch/mattmark-memorial'
    )
)
insert into public.local_events (
  source_key,
  location,
  category,
  title,
  start_date,
  end_date,
  time_text,
  venue,
  description,
  price,
  registration,
  source_url,
  is_active,
  updated_at
)
select
  source_key,
  location,
  category,
  title,
  start_date,
  coalesce(end_date, start_date),
  time_text,
  venue,
  description,
  price,
  registration,
  source_url,
  true,
  now()
from event_rows
on conflict (source_key) do update set
  location = excluded.location,
  category = excluded.category,
  title = excluded.title,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  time_text = excluded.time_text,
  venue = excluded.venue,
  description = excluded.description,
  price = excluded.price,
  registration = excluded.registration,
  source_url = excluded.source_url,
  is_active = true,
  updated_at = now();
