alter table public.properties
  add column if not exists property_type text not null default 'apartment';

alter table public.properties
  drop constraint if exists properties_property_type_check;

alter table public.properties
  add constraint properties_property_type_check
  check (property_type in ('apartment', 'hotel', 'guesthouse', 'general'));

comment on column public.properties.property_type is
  'Object type used by the concierge, for example apartment or hotel.';
