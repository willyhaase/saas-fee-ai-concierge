insert into public.restaurant_contacts (
  restaurant_name,
  whatsapp_phone,
  phone,
  email,
  accepts_whatsapp_reservations,
  reservation_notes
)
values
  ('Hannig', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Allalin', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Spielboden', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Längfluh', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Morenia', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Schäferstube', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Zer Schlucht', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Brasserie 1809', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('The Capra', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Walliserhof', null, null, null, true, 'Add the official WhatsApp-enabled phone number before enabling automatic reservations.'),
  ('Zur Mühle', '+41797531703', '+41 27 957 26 76', 'info@zurmuehle-saas-fee.ch', true, 'Reservation WhatsApp provided by project owner on 2026-06-12.')
on conflict (restaurant_name) do update set
  whatsapp_phone = excluded.whatsapp_phone,
  phone = excluded.phone,
  email = excluded.email,
  accepts_whatsapp_reservations = excluded.accepts_whatsapp_reservations,
  reservation_notes = excluded.reservation_notes,
  updated_at = now();
