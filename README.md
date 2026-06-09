# SaaS Fee AI Concierge

Local Next.js app with a `POST /api/chat` endpoint that:

- calls OpenAI for a customer-facing concierge reply
- connects to Supabase with server-side environment variables
- logs each conversation
- creates an incident when the message needs staff follow-up

## Requirements

- Node.js 20+
- npm
- an OpenAI API key
- a Supabase project with the existing `conversations` and `incidents` tables

## Environment Variables

Create `.env.local` in this project directory:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SUPABASE_CONVERSATIONS_TABLE=conversations
SUPABASE_INCIDENTS_TABLE=incidents
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is recommended because the API route writes server-side records. Keep it out of client code and do not commit `.env.local`.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are supported as fallbacks.
- The table env vars are optional if your tables are named `conversations` and `incidents`.
- The route uses the existing Supabase schema. It does not create or migrate tables.

## Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test the Chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Our billing import failed and customers are seeing wrong fees.",
    "customerName": "Ada Lovelace",
    "customerEmail": "ada@example.com"
  }'
```

Expected response shape:

```json
{
  "success": true,
  "reply": "Thanks for flagging this...",
  "conversationId": "uuid-or-null",
  "incidentCreated": true,
  "incidentId": "uuid-or-null",
  "priority": "high"
}
```

## API Contract

`POST /api/chat`

Request body:

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

`createIncident: true` forces incident creation. Otherwise OpenAI classifies whether an incident is required.

## Supabase Writes

By default, the route writes to:

- `conversations`
- `incidents`

The insert payloads try common existing column names such as `user_message`, `assistant_message`, `message`, `response`, `title`, `description`, `priority`, `status`, and `conversation_id`. If your schema uses different required columns, add the matching payload shape in `src/app/api/chat/route.ts` or expose a database function/RPC that maps the API payload to your schema.
