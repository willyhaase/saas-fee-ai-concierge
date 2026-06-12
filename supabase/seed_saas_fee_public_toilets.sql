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
      'public_toilets',
      'Öffentliche Toiletten in Saas-Fee',
      'Wenn Gäste nach Toiletten, WC oder öffentlichen Toiletten fragen, antworte auf Deutsch und nenne konkrete nahe Optionen. Quelle: OpenStreetMap/Overpass amenity=toilets, OSM-Datenstand 2026-06-12T07:34:55Z. Wichtig: Einige OSM-Punkte haben keine offiziellen Namen; nenne dann den nächstliegenden Bereich und die Koordinaten. Wenn keine Öffnungszeiten angegeben sind, sage nicht, dass die Toilette sicher geöffnet ist.'
    ),
    (
      'public_toilets',
      'WC Postplatz / Bus Terminal Saas-Fee',
      'Öffentliche Toilette beim Postplatz / Bus Terminal Saas-Fee, Koordinaten 46.1086429, 7.9295247. OSM-Tags: fee=no, wheelchair=yes. Diese Toilette ist die beste erste Empfehlung für Gäste im Dorfzentrum, am Bus Terminal oder bei Ankunft/Abreise.'
    ),
    (
      'public_toilets',
      'WC westlicher Dorfbereich / Parking-Seite',
      'Öffentliche Toilette im westlichen Dorfbereich Richtung Parking-Seite, Koordinaten 46.1075294, 7.9251269. OSM-Tags: female=yes, male=yes, changing_table=yes, wheelchair=yes. Gut erwähnen, wenn Gäste nahe Parking, westlicher Dorfseite oder mit Kindern unterwegs sind.'
    ),
    (
      'public_toilets',
      'WC unterer Dorfbereich / Bergbahnseite',
      'Öffentliche Toiletten im unteren Dorfbereich Richtung Bergbahn-/Alpin-Express-Seite: 46.1056784, 7.9277166 mit access=yes; 46.1059486, 7.9280112 mit access=yes und opening_hours=08:30-17:00. Diese Punkte sind nützlich für Gäste, die Richtung Bergbahnen, Skipisten oder südlicher Dorfbereich gehen.'
    ),
    (
      'public_toilets',
      'WC südlicher Dorfbereich',
      'Öffentliche Toilette als Gebäude im südlichen Dorfbereich, Koordinaten 46.1027821, 7.9266530. OSM-Tags: fee=no, female=yes, male=yes, wheelchair=yes. Nützlich für Gäste im unteren/südlichen Teil von Saas-Fee; wenn der Gast eine exakte Navigation braucht, nenne die Koordinaten.'
    ),
    (
      'public_toilets',
      'WC östlicher Dorfbereich',
      'Öffentliche Toiletten im östlichen Dorfbereich: 46.1102494, 7.9320736 mit fee=no und check_date=2025-07-14; 46.1104902, 7.9312565 mit note=location is approximate und source=survey. Bei diesen Punkten keine sicheren Öffnungszeiten nennen; als nahe OSM-Toilettenpunkte im östlichen Dorfbereich beschreiben.'
    ),
    (
      'public_toilets',
      'WC südwestlicher Bereich Saas-Fee',
      'Öffentliche Toilette im südwestlichen Bereich von Saas-Fee, Koordinaten 46.0977982, 7.9206343. OSM-Tags: fee=no, unisex=yes, wheelchair=limited. Erwähne wheelchair=limited, wenn nach Barrierefreiheit gefragt wird.'
    ),
    (
      'public_toilets',
      'Antwortstil für öffentliche Toiletten',
      'Bei WC-Fragen nicht nur allgemein antworten. Frage nach dem aktuellen Standort des Gastes, falls unklar, und nenne dann 1-3 passende Optionen: Postplatz/Bus Terminal für Zentrum und Ankunft; westlicher Dorfbereich/Parking-Seite für Parking/Kinderwagen; unterer Dorfbereich/Bergbahnseite für Alpin Express und südliche Dorfseite. Wenn Öffnungszeiten fehlen, ehrlich sagen: Die Daten enthalten keine garantierten Öffnungszeiten.'
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
