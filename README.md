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
```

Важно:

- `SUPABASE_SERVICE_ROLE_KEY` нужен только на сервере. Не используй его в клиентском коде.
- `OPENAI_MODEL` можно не задавать. По умолчанию используется `gpt-4o-mini`.
- Если таблицы называются `conversations` и `incidents`, переменные `SUPABASE_CONVERSATIONS_TABLE` и `SUPABASE_INCIDENTS_TABLE` можно не задавать.
- Если таблицы называются иначе, укажи реальные имена в Vercel.
- `REQUIRE_GUEST_ACCESS_TOKEN=true` включает строгий режим: локальная информация жилья выдаётся только по гостевой ссылке с access token.

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
https://your-domain.vercel.app/?propertyId=<PROPERTY_ID>&access=<RAW_GUEST_TOKEN>
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
  inserted.valid_until
from token, inserted;
```

`raw_token` показывается только в результате этого запроса. Его нужно вставить в ссылку гостя, а в базе останется только hash.

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

## Меню ресторанов

Для меню, цен и среднего чека используется таблица `public.restaurant_menus`.

Чтобы создать таблицу и добавить стартовые карточки ресторанов, выполни в Supabase SQL Editor:

```text
supabase/seed_restaurant_menus_template.sql
```

Для меню Hannig с ценами выполни:

```text
supabase/seed_hannig_menu.sql
```

Шаблон создаёт строки для:

- Hannig
- Schäferstube
- Zer Schlucht
- Brasserie 1809
- The Capra
- Walliserhof

В шаблоне нет выдуманных цен. Заполни `average_check_min_chf`, `average_check_max_chf`, `price_chf`, `price_text`, `source_url` и `source_updated_at` по актуальному меню/PDF/фото. После этого `/api/chat` сможет отвечать на вопросы вроде “что поесть в Hannig и сколько примерно стоит”.

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
