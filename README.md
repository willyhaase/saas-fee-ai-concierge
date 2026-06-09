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
```

Важно:

- `SUPABASE_SERVICE_ROLE_KEY` нужен только на сервере. Не используй его в клиентском коде.
- `OPENAI_MODEL` можно не задавать. По умолчанию используется `gpt-4o-mini`.
- Если таблицы называются `conversations` и `incidents`, переменные `SUPABASE_CONVERSATIONS_TABLE` и `SUPABASE_INCIDENTS_TABLE` можно не задавать.
- Если таблицы называются иначе, укажи реальные имена в Vercel.

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
