# SaaS Fee AI Concierge

Next.js-приложение с endpoint `POST /api/chat`.

Endpoint:

- вызывает OpenAI и возвращает ответ клиенту
- подключается к Supabase через серверные переменные окружения
- записывает каждый диалог
- создаёт инцидент, если сообщение требует реакции команды

## Требования

- Node.js 20+
- npm
- OpenAI API key
- Supabase project

## Переменные окружения

Создай `.env.local` локально или добавь эти переменные в Vercel:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SUPABASE_CONVERSATIONS_TABLE=conversations
SUPABASE_INCIDENTS_TABLE=incidents

# Optional: require guest links for property-local data
REQUIRE_GUEST_ACCESS_TOKEN=false

# Optional: protect /api/stats and /stats
STATS_ACCESS_TOKEN=change-me

# Optional: WhatsApp via Twilio for restaurant reservations
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+15559671989
TWILIO_RESERVATION_CONTENT_SID=HX...
TWILIO_GUEST_CONFIRMATION_CONTENT_SID=HX...
TWILIO_INCIDENT_CONTENT_SID=HX...
TWILIO_WEBHOOK_AUTH_TOKEN=...
TWILIO_WEBHOOK_PUBLIC_URL=https://willyhaase-saas-fee-ai-concierge.vercel.app/api/twilio/whatsapp

# Optional: which incident priorities notify the property owner on WhatsApp
CRITICAL_INCIDENT_PRIORITIES=urgent

# Optional: Meta WhatsApp Cloud API fallback
WHATSAPP_ACCESS_TOKEN=EA...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_GRAPH_API_VERSION=v23.0
WHATSAPP_RESERVATION_TEMPLATE_NAME=restaurant_reservation_request
WHATSAPP_RESERVATION_TEMPLATE_LANGUAGE=de
WHATSAPP_INCIDENT_TEMPLATE_NAME=property_critical_incident
WHATSAPP_INCIDENT_TEMPLATE_LANGUAGE=de
WHATSAPP_WEBHOOK_VERIFY_TOKEN=make-a-long-random-string
```

Важно:

- `SUPABASE_SERVICE_ROLE_KEY` нужен только на сервере. Не используй его в клиентском коде.
- `OPENAI_MODEL` можно не задавать. По умолчанию используется `gpt-4o-mini`.
- Если таблицы называются `conversations` и `incidents`, переменные `SUPABASE_CONVERSATIONS_TABLE` и `SUPABASE_INCIDENTS_TABLE` можно не задавать.
- Если таблицы называются иначе, укажи реальные имена в Vercel.
- `REQUIRE_GUEST_ACCESS_TOKEN=true` включает строгий режим: локальная информация жилья выдаётся только по гостевой ссылке с access token.
- `STATS_ACCESS_TOKEN` включает защиту статистики. Если переменная задана, открывай `/stats?token=<STATS_ACCESS_TOKEN>`.
- `WHATSAPP_PROVIDER=twilio` включает отправку WhatsApp через Twilio.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` и `TWILIO_WHATSAPP_FROM=whatsapp:+15559671989` нужны для Twilio Messages API.
- `TWILIO_RESERVATION_CONTENT_SID` рекомендуется для первого исходящего сообщения ресторану. Это approved WhatsApp template в Twilio Content Template Builder, обычно начинается с `HX...`.
- `TWILIO_GUEST_CONFIRMATION_CONTENT_SID` используется для WhatsApp template, который отправляется гостю после подтверждения ресторана.
- `TWILIO_INCIDENT_CONTENT_SID` используется для WhatsApp template, который отправляет владельцу/контакту недвижимости уведомление о критическом инциденте.
- `TWILIO_WEBHOOK_AUTH_TOKEN` используется для проверки подписи входящих Twilio webhooks. Можно указать тот же секрет, что и `TWILIO_AUTH_TOKEN`.
- `TWILIO_WEBHOOK_PUBLIC_URL` должен совпадать с URL webhook, указанным в Twilio. Это помогает корректно проверять подпись webhook на Vercel.
- Если `TWILIO_RESERVATION_CONTENT_SID` не задан, приложение попробует отправить обычный `Body`, но WhatsApp/Twilio может отклонить сообщение вне разрешённого 24-часового окна переписки.
- `CRITICAL_INCIDENT_PRIORITIES=urgent` означает, что WhatsApp владельцу отправляется только для `urgent` инцидентов. Можно указать `urgent,high`, если нужно уведомлять и о high.
- `WHATSAPP_ACCESS_TOKEN` и `WHATSAPP_PHONE_NUMBER_ID` нужны только если используется `WHATSAPP_PROVIDER=meta` для Meta WhatsApp Cloud API.
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` нужен для настройки Webhooks в Meta. Это не access token, а любая длинная секретная строка, которую ты сам задаёшь одинаково в Vercel и Meta.

## Supabase Schema

Если в Supabase ещё нет таблиц для диалогов и инцидентов, выполни SQL из файла:

```text
supabase/schema.sql
```

Как применить:

1. Открой Supabase Dashboard.
2. Перейди в SQL Editor.
3. Вставь содержимое `supabase/schema.sql`.
4. Нажми Run.
5. Сделай redeploy проекта в Vercel.

Файл создаёт:

- `public.conversations`
- `public.incidents`

## Разделение базы знаний

База делится на два слоя:

- **Общий слой**: информация, доступная всем гостям и всем объектам. Таблица `public.global_knowledge`.
- **Локальный слой жилья**: информация конкретного объекта. Это `properties`, `property_contacts`, `property_instructions`, `property_faq`, `conversation_logs`, `incidents`. В строгом режиме чат использует этот слой только при наличии валидной гостевой ссылки.

Миграция для этой модели:

```text
supabase/migrations/20260610_split_global_and_property_knowledge.sql
```

Она добавляет:

- `public.global_knowledge`
- `public.guest_property_access`
- `public.conversations.property_id`
- индексы
- RLS для общего и локального слоёв

Гостевая ссылка должна передавать:

```text
https://your-domain.vercel.app/apartments/<PROPERTY_SLUG>?access=<RAW_GUEST_TOKEN>
```

Главная страница `https://your-domain.vercel.app/` работает как общий Saas-Fee чат и не получает доступ к локальной информации апартаментов. Локальная информация жилья доступна только на странице `/apartments/<PROPERTY_SLUG>` при валидном `access` token.

Для красивого URL сначала задайте slug объекту:

```sql
update public.properties
set slug = 'studio-atlantic'
where id = '<PROPERTY_ID>'::uuid;
```

API хэширует `access` через SHA-256 и ищет его в `guest_property_access.access_token_hash`. Сырой token не хранится в базе.

Пример создания гостевого token в Supabase SQL Editor:

```sql
with token as (
  select encode(gen_random_bytes(24), 'hex') as raw_token
),
inserted as (
  insert into public.guest_property_access (
    property_id,
    access_token_hash,
    label,
    valid_until
  )
  select
    '<PROPERTY_ID>'::uuid,
    encode(digest(raw_token, 'sha256'), 'hex'),
    'Guest stay',
    now() + interval '14 days'
  from token
  returning id, property_id, label, valid_until
)
select
  token.raw_token,
  inserted.property_id,
  inserted.valid_until,
  'https://your-domain.vercel.app/apartments/studio-atlantic?access=' || token.raw_token as guest_url
from token, inserted;
```

`raw_token` показывается только в результате этого запроса. Его нужно вставить в ссылку гостя, а в базе останется только hash.

## Seed для апартаментов

Для дома Shangri-La в Saas-Fee выполни в Supabase SQL Editor:

```text
supabase/seed_shangri_la_apartments.sql
```

Файл добавляет 9 апартаментов:

- Shangri-La Nadelhorn
- Shangri-La Suedlenz
- Shangri-La Weissmies
- Shangri-La Taeschhorn
- Shangri-La Allalin
- Shangri-La Alphubel
- Shangri-La Strahlhorn
- Shangri-La Fletschhorn
- Shangri-La Felskinn

Seed можно запускать повторно. Он обновляет `properties`, перезаписывает контакты и инструкции только для этих Shangri-La объектов. Публичный источник не содержит точный WhatsApp, инструкции по ключам, check-in и Wi-Fi пароль, поэтому эти данные нужно дозаполнить из внутренних документов объекта перед выдачей гостевых ссылок.

## Общая информация о Saas-Fee

Чтобы чат отвечал на вопросы про рестораны, активности, горные подъёмники/дороги и погоду, выполни в Supabase SQL Editor файл:

```text
supabase/seed_saas_fee_global_knowledge.sql
```

Он создаёт `public.global_knowledge`, если таблицы ещё нет, и добавляет общий слой знаний:

- рестораны и mountain restaurants
- culinary trail
- летние и зимние активности
- hiking, biking, climbing/mountaineering
- открытые подъёмники и расписания cable cars
- SaastalCard
- погода, webcams и mountain safety
- банк, банкомат и обмен валют
- контакт туристического офиса

Файл можно запускать повторно. Он обновляет только свои записи с теми же `category` и `title`.

Погода не хранится как статичный прогноз в базе. `/api/chat` добавляет в контекст live weather snapshot для Saas-Fee через Open-Meteo, а для точной проверки рекомендует официальные страницы Saas-Fee weather/webcams.

Курс валют тоже не хранится как статичная цифра. `/api/chat` пытается получить актуальный курс со страницы Erlebnisbank Saas-Fee; если курс недоступен в машиночитаемом виде, чат отвечает адресом банка и не придумывает значения.

## Мероприятия и активности

Для событий с датами используется таблица `public.local_events`. Чтобы создать таблицу и загрузить мероприятия Saas-Fee, Saas-Grund и Saas-Almagell на сезон 2026, выполни в Supabase SQL Editor:

```text
supabase/seed_saas_fee_events_2026.sql
```

Файл можно запускать повторно. Он обновляет события по `source_key` и не создаёт дубликаты.

В `local_events` хранятся:

- крупные события с конкретными датами
- weekly programme
- активности по запросу
- деревня/локация, время, место, цена и регистрация

`/api/chat` читает только активные и будущие события, поэтому прошедшие мероприятия не должны попадать в ответы гостям.

## Общественные туалеты

Для общественных туалетов в Saas-Fee выполни в Supabase SQL Editor:

```text
supabase/seed_saas_fee_public_toilets.sql
```

Файл добавляет в `public.global_knowledge` WC-точки из OpenStreetMap/Overpass:

- Postplatz / Bus Terminal
- westlicher Dorfbereich / Parking-Seite
- unterer Dorfbereich / Bergbahnseite
- südlicher Dorfbereich
- östlicher Dorfbereich
- südwestlicher Bereich

Если у точки нет официального названия или гарантированных часов работы, чат должен говорить это честно и использовать координаты/ориентир.

## Карта впечатлений лето 2026

Для данных из PDF `Erlebniskarte-Sommer-2026-EN.pdf` выполни:

```text
supabase/seed_summer_2026_attractions_map.sql
```

Файл добавляет в базу:

- family, outdoor, adventure и indoor активности
- hiking и biking маршруты
- музеи, wellness, sports grounds, mountain guides
- цены парковки, канаток и bike tickets
- расписание основных канаток летом/осенью 2026
- emergency contacts и mountain restaurants/huts
- top events из карты

Для интерактивной Genially-карты Saas-Fee/Saastal выполни:

```text
supabase/seed_genially_interactive_map.sql
```

Этот файл добавляет более подробные описания интерактивных точек: Allalin, Längfluh, Spielboden, Hannig, Plattjen, Mattmark, Furggstalden, via ferrata, mountain huts, themed trails, Mountaincarts, Glacier Tour и другие объекты.

Для официальной карты пешеходных маршрутов Saas-Fee/Saastal выполни:

```text
supabase/seed_saas_fee_hiking_maps.sql
```

Файл добавляет официальный источник `Maps & Guides` с интерактивной summer hiking map Saastal и правила, когда чат должен дать карту, а когда сначала подобрать конкретный маршрут.

## Меню ресторанов

Для меню, цен и среднего чека используется таблица `public.restaurant_menus`.

Чтобы создать таблицу и добавить стартовые карточки ресторанов, выполни в Supabase SQL Editor:

```text
supabase/seed_restaurant_menus_template.sql
```

Для меню Hannig с ценами из PDF Winterkarte 25/26 выполни:

```text
supabase/seed_hannig_menu.sql
```

Этот seed использует PDF-меню Hannig:

```text
https://de.cdn-website.com/3dca206eb97244728f6472178d501c4d/files/uploaded/Winterkarte+2526+%282%29-e41b79e8.pdf
```

Для ресторана Zur Mühle с адресом, контактами, WhatsApp для заявок на бронь, часами работы, средним чеком, ценами из меню и ссылкой на PDF-меню выполни:

```text
supabase/seed_zur_muehle_restaurant.sql
```

Шаблон создаёт строки для:

- Hannig
- Schäferstube
- Zer Schlucht
- Brasserie 1809
- The Capra
- Walliserhof
- Zur Mühle

В шаблоне нет выдуманных цен. Заполни `average_check_min_chf`, `average_check_max_chf`, `price_chf`, `price_text`, `source_url` и `source_updated_at` по актуальному меню/PDF/фото. После этого `/api/chat` сможет отвечать на вопросы вроде “что поесть в Hannig и сколько примерно стоит”.

Если у строк меню заполнен `source_url`, чат при вопросе о меню даёт короткую выжимку по блюдам/ценам и показывает кликабельную ссылку на полный PDF прямо в сообщении.

## Резервирование столика

Для автоматической отправки заявок в рестораны через WhatsApp Business Platform выполни миграцию:

```text
supabase/migrations/20260611_add_restaurant_reservations.sql
```

Для хранения подтверждений ресторана и отправки подтверждения гостю выполни также:

```text
supabase/migrations/20260612_add_restaurant_confirmation_tracking.sql
```

Она создаёт:

- `public.restaurant_contacts` — WhatsApp/phone/email ресторанов
- `public.restaurant_reservations` — заявки на бронирование и статус WhatsApp-отправки

Затем добавь шаблон контактов:

```text
supabase/seed_restaurant_contacts_template.sql
```

После запуска шаблона замени `whatsapp_phone` на реальные WhatsApp-enabled номера ресторанов в международном формате, например `+41790000000`.

Когда гость просит забронировать столик, `/api/chat` собирает:

- ресторан
- дату
- время
- количество гостей
- имя гостя
- телефон или WhatsApp гостя
- особые пожелания

Если данных не хватает, чат задаёт уточняющий вопрос на немецком. Если данные есть, создаётся запись в `restaurant_reservations` и отправляется WhatsApp-сообщение в ресторан.

Важно: чат говорит гостю только о `Reservierungsanfrage`. Бронь считается подтверждённой только после ответа ресторана.

Статусы:

- `requested` — заявка записана, но не отправлена. Проверь `whatsapp_error`: если там `Missing reservation fields`, не хватило данных для отправки.
- `sent_to_restaurant` — WhatsApp-сообщение отправлено
- `needs_restaurant_contact` — у ресторана нет WhatsApp-номера в базе
- `pending_whatsapp_config` — не заданы WhatsApp env-переменные
- `whatsapp_failed` — WhatsApp API вернул ошибку
- `confirmed`, `declined`, `cancelled` — статусы для ручного обновления после ответа ресторана

### Диагностика WhatsApp `(#200)`

Этот раздел относится к `WHATSAPP_PROVIDER=meta`. При `WHATSAPP_PROVIDER=twilio` отправка идёт через Twilio, и ошибки будут приходить от Twilio Messages API.

Ошибка Meta `(#200) You do not have the necessary permissions to send messages on behalf of this WhatsApp Business Account` почти всегда означает проблему не в тексте сообщения, а в связке:

```text
WHATSAPP_ACCESS_TOKEN -> system user/app -> WhatsApp Business Account -> WHATSAPP_PHONE_NUMBER_ID
```

Проверь локально или в окружении, где есть реальные WhatsApp env vars:

```bash
npm run whatsapp:diagnose
```

Скрипт не печатает токен. Он проверяет, может ли токен прочитать `WHATSAPP_PHONE_NUMBER_ID`, показывает привязанный WABA ID и, если задан `META_APP_ACCESS_TOKEN` или `META_APP_ID` + `META_APP_SECRET`, проверяет scopes токена.

Для отправки сообщений токен должен:

- быть токеном system user или подходящим permanent token для того же Meta app
- иметь permission `whatsapp_business_messaging`
- быть выдан system user, которому назначен нужный WhatsApp Business Account
- использовать именно WhatsApp **phone number ID**, не WABA ID, Business ID или App ID

Если диагностика падает уже на чтении `WHATSAPP_PHONE_NUMBER_ID`, исправь доступы в Meta Business Manager: Business Settings → Users → System users → нужный system user → Assigned assets → WhatsApp Accounts → включить нужный WABA и права Manage/Full control, затем сгенерировать новый token с `whatsapp_business_messaging`.

### Настройка WhatsApp Webhooks

На экране Meta “Настроить Webhooks” заполни:

```text
URL обратного вызова:
https://<your-vercel-domain>/api/whatsapp/webhook

Подтверждение маркера:
значение WHATSAPP_WEBHOOK_VERIFY_TOKEN из Vercel
```

Например:

```text
https://willyhaase-saas-fee-ai-concierge.vercel.app/api/whatsapp/webhook
```

После добавления `WHATSAPP_WEBHOOK_VERIFY_TOKEN` в Vercel сделай redeploy. Только после этого Meta сможет нажать “Подтвердить и сохранить”.

Важно: Webhooks нужны для входящих сообщений и статусов. Они не исправляют ошибку `(#200)` при отправке; для неё нужны правильные права токена и правильный `WHATSAPP_PHONE_NUMBER_ID`.

Если используется WhatsApp template, создай approved template с именем из `WHATSAPP_RESERVATION_TEMPLATE_NAME`. Текущий код передаёт 8 body-параметров:

```text
restaurantName, reservationDate, reservationTime, partySize, guestName, guestContact, propertyName, specialRequests
```

Если используется Twilio, создай approved WhatsApp template в Twilio Content Template Builder и добавь его SID в `TWILIO_RESERVATION_CONTENT_SID`. Код передаёт 9 значений как `ContentVariables`:

```text
1 = restaurantName
2 = reservationDate
3 = reservationTime
4 = partySize
5 = guestName
6 = guestContact
7 = propertyName
8 = specialRequests
9 = reservationId
```

При успешной отправке в `restaurant_reservations.whatsapp_message_id` сохраняется Twilio Message SID, обычно он начинается с `SM...`.

Для template ресторана можно добавить quick reply кнопку:

```text
Button text:
Reservierung bestätigen

Button payload:
confirm:{{9}}
```

Если Twilio UI не разрешает переменную в payload, используй статичный payload `confirm`. В этом случае webhook найдёт последнюю отправленную этому ресторану заявку, но вариант `confirm:{{9}}` надёжнее.

Для подтверждения гостю создай отдельный approved template и добавь его SID в `TWILIO_GUEST_CONFIRMATION_CONTENT_SID`. Код передаёт 5 значений:

```text
1 = guestName
2 = restaurantName
3 = reservationDate
4 = reservationTime
5 = partySize
```

Пример немецкого текста:

```text
Hallo {{1}}, Ihre Tischreservierung im Restaurant {{2}} am {{3}} um {{4}} Uhr für {{5}} Personen wurde bestätigt.

Saas-Fee Concierge
```

Для входящих ответов/кнопок ресторана укажи в Twilio WhatsApp sender webhook:

```text
https://willyhaase-saas-fee-ai-concierge.vercel.app/api/twilio/whatsapp
```

Webhook обновляет бронь на `confirmed`, заполняет `confirmed_at`, `confirmed_by_phone`, `guest_confirmation_message_id` или `guest_confirmation_error`.

Быстрая диагностика:

```sql
select
  created_at,
  restaurant_name,
  guest_name,
  guest_contact,
  party_size,
  reservation_date,
  reservation_time,
  status,
  whatsapp_message_id,
  whatsapp_error
from public.restaurant_reservations
order by created_at desc
limit 20;
```

## WhatsApp уведомления по критическим инцидентам

Когда `/api/chat` создаёт инцидент с priority из `CRITICAL_INCIDENT_PRIORITIES`, приложение отправляет WhatsApp уведомление контакту недвижимости из:

```text
public.property_contacts.whatsapp
```

По умолчанию критическим считается только:

```text
urgent
```

Чтобы уведомлять также по `high`, добавь в Vercel:

```text
CRITICAL_INCIDENT_PRIORITIES=urgent,high
```

Для Twilio рекомендуется создать approved WhatsApp template и указать его SID:

```text
TWILIO_INCIDENT_CONTENT_SID=HX...
```

Код передаёт 8 значений как `ContentVariables`:

```text
1 = propertyName
2 = priority
3 = incidentTitle
4 = incidentDescription
5 = customerName
6 = customerEmail
7 = conversationId
8 = incidentId
```

Пример немецкого template:

```text
Kritischer Vorfall - Saas-Fee AI Concierge

Unterkunft: {{1}}
Priorität: {{2}}
Titel: {{3}}
Beschreibung: {{4}}
Gast: {{5}}
Kontakt: {{6}}
Conversation ID: {{7}}
Incident ID: {{8}}

Bitte so schnell wie möglich prüfen.
```

Если `TWILIO_INCIDENT_CONTENT_SID` не задан, приложение попробует отправить обычный WhatsApp `Body`. Twilio/WhatsApp может отклонить такое сообщение вне разрешённого окна переписки, поэтому template надёжнее.

Уведомление не заменяет создание инцидента: если WhatsApp отправка не удалась или у объекта нет `property_contacts.whatsapp`, инцидент всё равно будет создан, а результат попадёт в `incidentWhatsAppNotification` в API-ответе и, если доступно поле `metadata`, в `incidents.metadata.property_owner_whatsapp_notification`.

## Статистика запросов

Для статистики используется таблица `public.query_analytics`. Чтобы создать её, выполни в Supabase SQL Editor:

```text
supabase/migrations/20260611_add_query_analytics.sql
```

После этого новые запросы в `/api/chat` будут сохранять:

- категорию вопроса
- тип намерения: рекомендация, цена, меню, маршрут, часы работы и т.д.
- интересующие рестораны
- интересующие активности
- другие найденные сущности

Статистика доступна:

```text
/stats
/api/stats
```

Если задан `STATS_ACCESS_TOKEN`, используй:

```text
/stats?token=<STATS_ACCESS_TOKEN>
/api/stats?token=<STATS_ACCESS_TOKEN>
```

## Локальный запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Проверка API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Our billing import failed and customers are seeing wrong fees.",
    "customerName": "Ada Lovelace",
    "customerEmail": "ada@example.com"
  }'
```

Для Vercel замени URL на свой production domain:

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Our billing import failed and customers are seeing wrong fees.",
    "customerName": "Ada Lovelace",
    "customerEmail": "ada@example.com"
  }'
```

Успешный ответ:

```json
{
  "success": true,
  "reply": "Thanks for flagging this...",
  "conversationId": "uuid",
  "conversationTable": "conversations",
  "incidentCreated": true,
  "incidentId": "uuid",
  "incidentTable": "incidents",
  "priority": "high"
}
```

## API Contract

`POST /api/chat`

Тело запроса:

```json
{
  "message": "Required customer message",
  "customerName": "Optional customer name",
  "customerEmail": "Optional customer email",
  "conversationId": "Optional existing conversation id",
  "context": { "plan": "enterprise" },
  "createIncident": false
}
```

`createIncident: true` принудительно создаёт инцидент. Иначе OpenAI сам классифицирует, нужен ли инцидент.
