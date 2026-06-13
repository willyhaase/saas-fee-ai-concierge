alter table public.properties
  add column if not exists slug text;

create unique index if not exists properties_slug_unique_idx
  on public.properties(slug)
  where slug is not null;

comment on column public.properties.slug is
  'Public URL slug for apartment chat pages, for example studio-atlantic.';
