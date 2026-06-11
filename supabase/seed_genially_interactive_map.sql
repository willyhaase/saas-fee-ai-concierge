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
      'interactive_map',
      'Genially interactive summer map source',
      'Interactive Saas-Fee/Saastal summer map by Saastal Tourismus AG. Source URL: https://view.genially.com/69ef71041cfc14c258a755f5. Use this as the richer interactive-map source for activity descriptions, mountain worlds, trails, huts and family/adventure recommendations. The map was modified on 7 May 2026 according to Genially metadata.'
    ),
    (
      'interactive_map',
      'When to offer the interactive map link',
      'Do not send the Genially link by default. Answer directly from the stored data first. Offer the interactive map link only when guests ask for a map, visual overview, interactive map, or want to browse all points themselves.'
    ),
    (
      'mountain_huts',
      'Almageller Hut',
      'Almageller Hut is on the south side of Weissmies. It is a base for high mountain tours, climbing and hiking, and also works as a day-trip destination. Recommend it for guests who want a classic hut experience with mountain streams, open views and a high-alpine atmosphere.'
    ),
    (
      'via_ferrata',
      'Via Ferrata Mittaghorn',
      'Via Ferrata Mittaghorn is described as an easier but scenic via ferrata, suitable for beginners with good fitness. The length should not be underestimated. It leads to a three-thousander with broad views over the Saas Valley and surrounding 4000 m peaks.'
    ),
    (
      'mountain_restaurants',
      'Mountain Restaurant Gletschergrotte',
      'Gletschergrotte is a cosy, family-friendly mountain restaurant with a sunny terrace, Swiss cuisine, seasonal dishes and homemade cakes. In summer it is reachable on foot from Saas-Fee village in about 50 minutes.'
    ),
    (
      'experience_worlds',
      'Spielboden home of the marmots',
      'Spielboden at 2448 m is the home of the marmots. It is good for families who want to watch or feed marmots. The Murmeli Trail adds information about marmots, and Restaurant Spielboden suits families and culinary guests.'
    ),
    (
      'experience_worlds',
      'Kreuzboden family mountain',
      'Kreuzboden at 2400 m above Saas-Grund is the main family mountain. In Adventure Land children can use the suspension bridge, climbing walls, air trampoline and water play park. Recommend it first for families with active children.'
    ),
    (
      'biking',
      'Hannig Bike interactive map details',
      'Hannig Bike is a new trail on the Sun Mountain above Saas-Fee. It is suited to guests discovering mountain biking or trying first enduro experiences. The red main trail is about 4 km long with 515 m downhill toward Saas-Fee, mixing flowing curves and natural trail sections. A 1.7 km blue loop is better for beginners or an extra round.'
    ),
    (
      'theme_trails',
      'Eddie and the Mountain Weather',
      'Eddie and the Mountain Weather is an interactive themed trail about mountain weather in the Saas Valley. It has digital stations, informative content, interactive games and surprising facts. Best for families with children from about 9 years old, teenagers and adults.'
    ),
    (
      'experience_worlds',
      'Mittelallalin and Allalin',
      'Mittelallalin at 3500 m is above Saas-Fee, surrounded by 4000 m peaks. Highlights include Metro Alpin, the highest underground railway in the world, the revolving restaurant, VirtuAllalin and summer ski training views. It is also the access point for guided Allalinhorn ambitions.'
    ),
    (
      'experience_worlds',
      'Längfluh glacier world',
      'Längfluh at about 2870 m brings guests close to the glaciers. From the Längfluh cable car station, the path to the glacial lakes takes about 15 minutes. For a deeper glacier experience, recommend a guided tour on the Feegletscher.'
    ),
    (
      'adventure',
      'Mountaincarts from Hannig',
      'Mountaincarts run from Hannig toward Saas-Fee on a roughly 5 km natural road. The experience combines open panoramas, wide bends and changing terrain from high-alpine slopes toward the forest above the village.'
    ),
    (
      'adventure',
      'Glacier Experience Tour interactive map details',
      'The Glacier Experience Tour crosses the Feegletscher with crampons, ski poles and climbing harness. Guests start at Spielboden mountain station and move secured to the guide’s rope past séracs and glacier crevasses. It is only suitable with a mountain guide.'
    ),
    (
      'mountain_huts',
      'Mischabel Hut',
      'Mischabel Hut is on a narrow rocky ridge between the Hohbalm and Fall glaciers at 3340 m. It is the third-highest SAC hut in Switzerland. The ascent is demanding, about 4 hours from Saas-Fee or 3 hours from Hannig, but rewards guests with dramatic views.'
    ),
    (
      'winter',
      'Winter Playground Hannig',
      'Winter Playground Hannig brings back the legendary four-man bobsleigh idea in miniature. Families can rent a mini bobsleigh set from the mountain restaurant by leaving a deposit such as ID or passport, then build a mini bobsleigh track in the snow around the restaurant.'
    ),
    (
      'hiking',
      'Glacier Lake Hike Längfluh',
      'Glacier Lake Hike at Längfluh is a short circular high-alpine route near 3000 m. It starts at Längfluh mountain station, passes the Steinhaus area and viewpoints over the Saas-Fee glacier, and leads to lakes reflecting the highest Swiss mountains.'
    ),
    (
      'theme_trails',
      'Fairy Tale Trail',
      'Fairy Tale Trail runs in the larch forest between Mälchbodu and Bärufalla. Children and families follow the story of Pia on illustrated panels, with natural elements nearby that make the legend tangible.'
    ),
    (
      'experience_worlds',
      'Hannig Sun Mountain',
      'Hannig at 2336 m is the Sun Mountain above Saas-Fee. It is very sunny and has views of the Saas mountain range. Recommend it for the sun terrace, mountain restaurant, hiking, children’s playground, Märliweg at Mälchbodu and goats at Alpe Hannig.'
    ),
    (
      'experience_worlds',
      'Plattjen wild mountain',
      'Plattjen at 2570 m is a wild, rocky sightseeing mountain above Saas-Fee. Early morning offers the best chance to spot ibex and chamois. It is especially interesting for hikers and via ferrata guests.'
    ),
    (
      'theme_trails',
      'Mystery Trail The Legacy of the Dragon',
      'Mystery Trail in Furggstalden is an interactive adventure trail for families, children from about 8 years old, teenagers and adults. It follows a dragon legend through six stations with riddles, hidden clues and teamwork tasks.'
    ),
    (
      'mountains',
      'Weissmies',
      'Weissmies at 4017 m is the highest mountain between the Saas Valley, Simplon area and the Italian Valli d’Ossola. The north-west side is glacier-covered. The name refers to the Valais dialect word Mies, meaning moss, because the mountain appears covered in white moss.'
    ),
    (
      'events',
      'Stomping Grounds',
      'Stomping Grounds is an autumn high-performance training camp on the Fee Glacier for slopestyle, big air and halfpipe skiers and snowboarders. More than 200 freestyle professionals prepare for the season across two 10-day training sessions.'
    ),
    (
      'mountain_restaurants',
      'Almagelleralp',
      'Bergrestaurant Almagelleralp at 2194 m offers high-altitude culinary experiences above Saas-Almagell. Guests can also stay overnight in group accommodation or double rooms; toilets and showers are available on every floor. Reservation is recommended.'
    ),
    (
      'mountaineering',
      'Allalin my first four-thousander',
      'Allalinhorn at 4027 m is a classic first 4000 m peak in the Saas Valley. With a guide, good weather, endurance and sure-footedness, it is suitable for aspiring summit climbers. Always stress respect for altitude and mountain conditions.'
    ),
    (
      'experience_worlds',
      'VirtuAllalin',
      'VirtuAllalin is an interactive glacier experience with Pastor Johann Josef Imseng, tourism pioneer of the Saas Valley. Guests virtually fly over eternal ice, dive into the glacier and solve puzzles connected with the history and myths of the Saas Valley glaciers.'
    ),
    (
      'experience_worlds',
      'Mattmark Dam',
      'Mattmark Dam south of the Saas Valley is the largest earth dam in Europe. The reservoir is used for power generation and is a strong recommendation for guests who want water, wide views, engineering history and a quieter mountain setting.'
    ),
    (
      'adventure',
      'Rope Park Adventure Forest interactive map details',
      'Rope Park Adventure Forest has four zones with increasing difficulty in the larch trees. Obstacles are built into the course and each zone ends with a zip line back to the forest floor. Good for active families and groups.'
    ),
    (
      'theme_trails',
      'Murmeliweg Spielboden',
      'Murmeliweg on Spielboden is a circular trail from Spielboden mountain station toward Saas-Fee through marmot territory. Seven panels explain Murmeli Eddie and the marmot family; with luck guests can see marmots and feed them carrots, peanuts and dandelions.'
    ),
    (
      'experience_worlds',
      'Heidbodmen',
      'Heidbodmen above Furggstalden at about 2400 m offers panorama views of Monte Rosa, Strahlhorn, Egginer, Mittaghorn and the Mischabel foothills. Recommend it for guests seeking quiet views and a recovery-focused mountain place.'
    ),
    (
      'via_ferrata',
      'Jegihorn via ferrata',
      'Jegihorn via ferrata reaches 3206 m and is described as the highest in the Western Alps. It is one of Switzerland’s most beautiful via ferratas. Main difficulty K3, optional final variant K4-5, with around 400 footholds and 5 ladders. Only recommend in safe weather.'
    ),
    (
      'mountain_restaurants',
      'Mountain Restaurant Alpenblick',
      'Alpenblick is a hidden gem in the Hannig summer and winter hiking area, halfway between Hannig and Saas-Fee in the arven-larch forest. It offers a sun terrace, mountain views, Swiss dishes, homemade cakes, the Carl Zuckmayer room and a small dormitory for up to 10 people.'
    ),
    (
      'experience_worlds',
      'Furggstalden',
      'Furggstalden is an idyllic hamlet above Saas-Almagell, accessible by chairlift. It is good for relaxing views toward Mattmark and old Valais barns. Children can do a treasure hunt or ride scooters down the mountain.'
    ),
    (
      'mountain_restaurants',
      'Mountain Restaurant Felskinn',
      'Felskinn mountain station at 3000 m is a high-alpine starting point above Saas-Fee. The Felskinn restaurant is useful as a stop before or after alpine routes and the ascent toward Britannia Hut.'
    ),
    (
      'family',
      'Hannig playground adventure with a view',
      'Hannig Playground combines play, nature and panorama. The Glacier Swing lets children and adults swing above the Saas Valley, and climbing elements train balance, strength and skill.'
    ),
    (
      'mountain_huts',
      'Weissmieshütte',
      'Weissmieshütte SAC at 2726 m is at the foot of Lagginhorn and is a base for rock and ice tours. It is also accessible in summer for families with children. In winter it serves as a ski-area stop with Valais specialities and the famous cream slice.'
    ),
    (
      'hiking',
      'Path of the 18 four-thousanders',
      'Path of the 18 four-thousanders is a 1.2 km circular route from Hohsaas at about 3142 m. Guests can see the 18 impressive 4000 m peaks of the Saas Valley in nature and on information boards and monuments.'
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
