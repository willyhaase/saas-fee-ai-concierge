-- Hotel Bristol Saas-Fee as a guest-access property object.
-- Source checked: 2026-06-22
-- Website: https://www.hotel-bristol-saas-fee.ch/en/

create extension if not exists pgcrypto;

alter table public.properties
  add column if not exists property_type text not null default 'apartment';

alter table public.properties
  drop constraint if exists properties_property_type_check;

alter table public.properties
  add constraint properties_property_type_check
  check (property_type in ('apartment', 'hotel', 'guesthouse', 'general'));

alter table public.properties
  add column if not exists slug text;

create unique index if not exists properties_slug_unique_idx
  on public.properties(slug)
  where slug is not null;

insert into public.properties (name, slug, address, property_type)
values (
  'Hotel Bristol Saas-Fee',
  'hotel-bristol',
  'Dorfstrasse 60, 3906 Saas-Fee',
  'hotel'
)
on conflict (slug) where slug is not null
do update set
  name = excluded.name,
  address = excluded.address,
  property_type = excluded.property_type;

delete from public.property_contacts
where property_id = (
  select id from public.properties where slug = 'hotel-bristol' limit 1
);

insert into public.property_contacts (
  property_id,
  host_name,
  whatsapp,
  emergency_medical,
  police,
  fire,
  taxi
)
select
  id,
  'Hotel Bristol Saas-Fee',
  null,
  '144',
  '117',
  '118',
  '+41 27 957 70 20'
from public.properties
where slug = 'hotel-bristol';

delete from public.property_instructions
where property_id = (
  select id from public.properties where slug = 'hotel-bristol' limit 1
);

with p as (
  select id
  from public.properties
  where slug = 'hotel-bristol'
  limit 1
),
rows(category, title, content) as (
  values
    (
      'overview',
      'Hotel overview',
      'Hotel Bristol Saas-Fee is a 3-star ski-in/ski-out yoga and sport hotel at Dorfstrasse 60, 3906 Saas-Fee. It is about 1 minute from the ski lifts and 2 minutes from cable cars. Contact: +41 27 958 12 12, info@hotel-bristol-saas-fee.ch.'
    ),
    (
      'hotel',
      'Important wording for guests',
      'This object is a hotel, not an apartment. When guests ask about this property, call it Hotel Bristol, the hotel, or the accommodation. Do not describe it as an apartment unless the guest specifically asks about Apartment Bristolino.'
    ),
    (
      'location',
      'Location and nearby facilities',
      'Hotel Bristol is opposite the ski and snowboard meeting point, ice hockey and curling rink. In summer it is close to the Alpine golf course/driving range, sports ground, football, tennis, volleyball and basketball courts, mini-golf, cable cars, Feeblitz/toboggan train and hiking routes.'
    ),
    (
      'rooms',
      'Rooms and Bristolino apartment',
      'Room types include single rooms, twin/double rooms, family suite, panorama suite and Apartment Bristolino. Most rooms are south-facing with balcony and mountain/glacier views; single rooms are on the north side. Apartment Bristolino is a 92 m2 apartment beside the hotel for up to 6 people in 3 bedrooms.'
    ),
    (
      'restaurant',
      'Hotel restaurant',
      'Hotel Restaurant Bristol is inside the hotel. Summer opening hours listed by the hotel: 11:30-13:30 and 18:30-20:30. Winter: 18:30-20:30. Hotel guests can book a 4-course dinner for CHF 45 per person. In winter, Fondue Chinoise Buffet is offered every Saturday. Reservations: +41 27 958 12 12.'
    ),
    (
      'offers',
      'Hotel offers',
      'Known Bristol offers include Winter Package with Ski Pass, Yoga & Hiking Week, Bike & Hike Week, Wellbeing Week, Summer Ski on Glacier, Summer Early Bird / Short Stay, Golf information and Apartment Bristolino. For current availability and booking, use Hotel Bristol direct contact.'
    ),
    (
      'arrival',
      'Arrival and car-free village',
      'Saas-Fee is car-free. Guests arriving by car park at the Saas-Fee parking area/parking garage and continue by hotel transfer, local electric taxi/service or on foot. Hotel Bristol offers transport from/to the parking garage in some packages; guests should confirm this with the hotel for their booking.'
    )
)
insert into public.property_instructions (property_id, category, title, content)
select p.id, rows.category, rows.title, rows.content
from p
cross join rows;

delete from public.property_faq
where property_id = (
  select id from public.properties where slug = 'hotel-bristol' limit 1
);

with p as (
  select id
  from public.properties
  where slug = 'hotel-bristol'
  limit 1
),
rows(question, answer) as (
  values
    (
      'Is Bristol an apartment or a hotel?',
      'Hotel Bristol Saas-Fee is a hotel. It also has Apartment Bristolino beside the hotel, but the main object is Hotel Bristol as a ski-in/ski-out yoga and sport hotel.'
    ),
    (
      'How can guests contact Hotel Bristol?',
      'Phone: +41 27 958 12 12. Email: info@hotel-bristol-saas-fee.ch. Address: Dorfstrasse 60, 3906 Saas-Fee.'
    ),
    (
      'Can guests book dinner at the hotel restaurant?',
      'Yes. Hotel guests can book a 4-course dinner for CHF 45 per person. Table reservations are by phone: +41 27 958 12 12.'
    )
)
insert into public.property_faq (property_id, question, answer)
select p.id, rows.question, rows.answer
from p
cross join rows;
