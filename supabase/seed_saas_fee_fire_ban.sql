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
      'safety',
      'Fire ban in Valais',
      'ACHTUNG Feuerverbot! Es gilt ein Verbot von jeglichem Feuern im Freien mit sofortiger Wirkung für das gesamte Kantonsgebiet. Eine Entspannung der Lage ist erst nach einer intensiven Regenperiode von mindestens 3 Tagen zu erwarten. Kurze Regenschauer und Gewitter vermögen die gefährliche Situation nicht zu entschärfen. Die offiziellen Kontrollorgane werden jegliche Widerhandlungen den zuständigen Behörden anzeigen. Bei einem Brandausbruch handeln Sie nach dem Grundsatz: ALARMIEREN (118) - RETTEN - LÖSCHEN. When guests ask about BBQ, fire pits, outdoor fires, grilling in nature, campfires or mountain safety, clearly state that all outdoor fires are forbidden throughout the canton. Answer in the guest language, but keep the emergency principle and fire number 118 clear.'
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
