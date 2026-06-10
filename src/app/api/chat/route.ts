import { createHash } from "crypto";
import OpenAI from "openai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ChatRequest = {
  message?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  conversationId?: unknown;
  context?: unknown;
  createIncident?: unknown;
};

type ConciergeResponse = {
  reply: string;
  incident_required: boolean;
  incident_title: string | null;
  incident_description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
};

type InsertResult = {
  id: string | null;
  table: string;
  data: Record<string, unknown> | null;
};

type PropertyContext = {
  propertyId: string | null;
  propertyName: string | null;
  address: string | null;
  localAccessGranted: boolean;
  hostName: string | null;
  whatsapp: string | null;
  emergencyMedical: string | null;
  police: string | null;
  fire: string | null;
  taxi: string | null;
  instructions: Array<{
    category: string | null;
    title: string | null;
    content: string | null;
  }>;
  faq: Array<{
    question: string | null;
    answer: string | null;
  }>;
  localRecommendations: Array<{
    category: string | null;
    name: string | null;
    address: string | null;
    notes: string | null;
  }>;
  globalKnowledge: Array<{
    category: string | null;
    title: string | null;
    content: string | null;
  }>;
};

export const runtime = "nodejs";

function getEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

function getSupabase() {
  const url = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnv("SUPABASE_SERVICE_KEY") ||
    getEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getTableCandidates(envName: string, defaults: string[]) {
  const configured = process.env[envName]
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return unique([...(configured ?? []), ...defaults]);
}

function getPayloadContext(payload: ChatRequest) {
  return payload.context &&
    typeof payload.context === "object" &&
    !Array.isArray(payload.context)
    ? (payload.context as Record<string, unknown>)
    : null;
}

function getBooleanEnv(name: string) {
  return process.env[name]?.toLowerCase() === "true";
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isMissingTableError(message: string) {
  return message.includes("Could not find the table");
}

function parseOpenAIJson(content: string | null): ConciergeResponse {
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content) as Partial<ConciergeResponse>;

  return {
    reply:
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Thanks. I captured that and the team will review it shortly.",
    incident_required: Boolean(parsed.incident_required),
    incident_title:
      typeof parsed.incident_title === "string" && parsed.incident_title.trim()
        ? parsed.incident_title.trim()
        : null,
    incident_description:
      typeof parsed.incident_description === "string" &&
      parsed.incident_description.trim()
        ? parsed.incident_description.trim()
        : null,
    priority:
      parsed.priority === "low" ||
      parsed.priority === "medium" ||
      parsed.priority === "high" ||
      parsed.priority === "urgent"
        ? parsed.priority
        : "medium",
  };
}

async function getConciergeResponse(
  message: string,
  payload: ChatRequest,
  propertyContext: PropertyContext | null
): Promise<ConciergeResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a concise Saas-Fee guest AI concierge for a holiday rental.",
          "Use the supplied property context as the source of truth. Never invent contact details.",
          "Property context has two layers: globalKnowledge and localRecommendations are general information; property details, contacts, instructions, and FAQ are local housing information.",
          "Only use local housing information when propertyContext.localAccessGranted is true.",
          "If localAccessGranted is false and the guest asks about a specific apartment, access, Wi-Fi, host contact, or private housing instructions, ask them to open their guest-specific link.",
          "If the guest asks for WhatsApp, support contact, host contact, or how to reach the property team, provide the WhatsApp number from propertyContext only when localAccessGranted is true and whatsapp is available.",
          "If a fact is not present in propertyContext, say that you do not have it and offer to notify the host.",
          "Create incidents for broken heating, appliances, access issues, safety concerns, urgent maintenance, guest escalations, or anything requiring staff follow-up.",
          "Return only JSON with keys: reply, incident_required, incident_title, incident_description, priority. Priority must be low, medium, high, or urgent.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({
          message,
          customerName: asOptionalString(payload.customerName),
          customerEmail: asOptionalString(payload.customerEmail),
          conversationId: asOptionalString(payload.conversationId),
          context: payload.context ?? null,
          propertyContext,
        }),
      },
    ],
  });

  const response = parseOpenAIJson(completion.choices[0]?.message.content);

  if (payload.createIncident === true) {
    response.incident_required = true;
  }

  return response;
}

async function getPropertyContext(
  supabase: SupabaseClient,
  requestedPropertyId: string | null,
  guestAccessToken: string | null
): Promise<PropertyContext | null> {
  const globalKnowledge = await getGlobalKnowledge(supabase);
  const localRecommendations = await getLocalRecommendations(supabase);
  const propertyId = await resolvePropertyId(
    supabase,
    requestedPropertyId,
    guestAccessToken
  );

  if (!propertyId) {
    return {
      propertyId: null,
      propertyName: null,
      address: null,
      localAccessGranted: false,
      hostName: null,
      whatsapp: null,
      emergencyMedical: null,
      police: null,
      fire: null,
      taxi: null,
      instructions: [],
      faq: [],
      localRecommendations,
      globalKnowledge,
    };
  }

  const query = supabase
    .from("properties")
    .select(
      "id, name, address, property_contacts(host_name, whatsapp, emergency_medical, police, fire, taxi)"
    )
    .eq("id", propertyId);

  const { data, error } = await query.limit(1).maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Could not load property context: ${error.message}`);
    }
    return null;
  }

  const property = data as Record<string, unknown>;
  const contactsValue = property.property_contacts;
  const contact = Array.isArray(contactsValue)
    ? (contactsValue[0] as Record<string, unknown> | undefined)
    : (contactsValue as Record<string, unknown> | null);
  const [instructions, faq] = await Promise.all([
    getPropertyInstructions(supabase, propertyId),
    getPropertyFaq(supabase, propertyId),
  ]);

  return {
    propertyId: asOptionalString(property.id),
    propertyName: asOptionalString(property.name),
    address: asOptionalString(property.address),
    localAccessGranted: true,
    hostName: asOptionalString(contact?.host_name),
    whatsapp: asOptionalString(contact?.whatsapp),
    emergencyMedical: asOptionalString(contact?.emergency_medical),
    police: asOptionalString(contact?.police),
    fire: asOptionalString(contact?.fire),
    taxi: asOptionalString(contact?.taxi),
    instructions,
    faq,
    localRecommendations,
    globalKnowledge,
  };
}

async function resolvePropertyId(
  supabase: SupabaseClient,
  requestedPropertyId: string | null,
  guestAccessToken: string | null
) {
  if (guestAccessToken) {
    const tokenHash = hashAccessToken(guestAccessToken);
    const { data, error } = await supabase
      .from("guest_property_access")
      .select("property_id, active, valid_from, valid_until")
      .eq("access_token_hash", tokenHash)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const access = data as Record<string, unknown>;
      const now = Date.now();
      const validFrom = asOptionalString(access.valid_from);
      const validUntil = asOptionalString(access.valid_until);
      const startsOk = !validFrom || Date.parse(validFrom) <= now;
      const endsOk = !validUntil || Date.parse(validUntil) >= now;

      if (startsOk && endsOk) {
        return asOptionalString(access.property_id);
      }
    }
  }

  if (getBooleanEnv("REQUIRE_GUEST_ACCESS_TOKEN")) {
    return null;
  }

  if (requestedPropertyId) {
    return requestedPropertyId;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return asOptionalString((data as Record<string, unknown>).id);
}

async function getPropertyInstructions(
  supabase: SupabaseClient,
  propertyId: string
) {
  const { data, error } = await supabase
    .from("property_instructions")
    .select("category, title, content")
    .eq("property_id", propertyId)
    .limit(30);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    category: asOptionalString(item.category),
    title: asOptionalString(item.title),
    content: asOptionalString(item.content),
  }));
}

async function getPropertyFaq(supabase: SupabaseClient, propertyId: string) {
  const { data, error } = await supabase
    .from("property_faq")
    .select("question, answer")
    .eq("property_id", propertyId)
    .limit(30);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    question: asOptionalString(item.question),
    answer: asOptionalString(item.answer),
  }));
}

async function getLocalRecommendations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("local_recommendations")
    .select("category, name, address, notes")
    .limit(30);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    category: asOptionalString(item.category),
    name: asOptionalString(item.name),
    address: asOptionalString(item.address),
    notes: asOptionalString(item.notes),
  }));
}

async function getGlobalKnowledge(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("global_knowledge")
    .select("category, title, content")
    .eq("is_active", true)
    .limit(50);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    category: asOptionalString(item.category),
    title: asOptionalString(item.title),
    content: asOptionalString(item.content),
  }));
}

async function insertFirstMatching(
  supabase: SupabaseClient,
  tables: string[],
  candidates: Record<string, unknown>[]
): Promise<InsertResult> {
  let lastError: string | null = null;
  const attempted: string[] = [];

  for (const table of tables) {
    const tableErrors: string[] = [];

    for (const payload of candidates) {
      attempted.push(table);
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select("*")
        .single();

      if (!error) {
        const record = data as Record<string, unknown>;
        return {
          id: typeof record.id === "string" ? record.id : null,
          table,
          data: record,
        };
      }

      lastError = error.message;
      tableErrors.push(error.message);
    }

    if (tableErrors.some((message) => !isMissingTableError(message))) {
      throw new Error(
        `Could not insert into ${table}. Tried ${candidates.length} payload shape(s). Supabase errors: ${unique(
          tableErrors
        ).join(" | ")}`
      );
    }
  }

  throw new Error(
    `Could not insert into any matching table (${unique(attempted).join(
      ", "
    )}): ${lastError}`
  );
}

async function updateConversationIncident(
  supabase: SupabaseClient,
  table: string,
  conversationId: string | null,
  incidentId: string | null
) {
  if (!conversationId || !incidentId) {
    return;
  }

  const candidates = [
    { incident_id: incidentId },
    { linked_incident_id: incidentId },
  ];

  for (const payload of candidates) {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", conversationId);

    if (!error) {
      return;
    }
  }
}

export async function POST(req: Request) {
  let payload: ChatRequest;

  try {
    payload = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const message = asOptionalString(payload.message);

  if (!message) {
    return Response.json({ error: "A non-empty message is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const conversationTables = getTableCandidates("SUPABASE_CONVERSATIONS_TABLE", [
      "conversations",
      "chat_conversations",
      "conversation_logs",
      "chat_logs",
      "chat_messages",
      "messages",
    ]);
    const incidentTables = getTableCandidates("SUPABASE_INCIDENTS_TABLE", [
      "incidents",
      "support_incidents",
      "incident_reports",
      "tickets",
    ]);
    const customerName = asOptionalString(payload.customerName);
    const customerEmail = asOptionalString(payload.customerEmail);
    const requestConversationId = asOptionalString(payload.conversationId);
    const requestContext = getPayloadContext(payload);
    const requestPropertyId = asOptionalString(requestContext?.propertyId);
    const guestAccessToken =
      asOptionalString(requestContext?.guestAccessToken) ||
      asOptionalString(requestContext?.access);
    const propertyContext = await getPropertyContext(
      supabase,
      requestPropertyId,
      guestAccessToken
    );
    const ai = await getConciergeResponse(message, payload, propertyContext);
    const metadata = {
      requestConversationId,
      customerName,
      customerEmail,
      context: payload.context ?? null,
      propertyContext,
    };

    const conversation = await insertFirstMatching(supabase, conversationTables, [
      {
        user_message: message,
        assistant_message: ai.reply,
        incident_required: ai.incident_required,
        property_id: propertyContext?.propertyId,
        customer_name: customerName,
        customer_email: customerEmail,
        metadata,
      },
      {
        user_message: message,
        assistant_message: ai.reply,
        incident_required: ai.incident_required,
        customer_name: customerName,
        customer_email: customerEmail,
        metadata,
      },
      {
        message,
        response: ai.reply,
        incident_required: ai.incident_required,
        customer_name: customerName,
        customer_email: customerEmail,
        metadata,
      },
      {
        customer_message: message,
        ai_response: ai.reply,
        incident_required: ai.incident_required,
        customer_name: customerName,
        customer_email: customerEmail,
        metadata,
      },
      {
        input: message,
        output: ai.reply,
        metadata: { ...metadata, incident_required: ai.incident_required },
      },
    ]);

    let incident: InsertResult | null = null;

    if (ai.incident_required) {
      const title = ai.incident_title || "Customer support incident";
      const description = ai.incident_description || message;
      const incidentMetadata = {
        ...metadata,
        conversationId: conversation.id,
        conversationTable: conversation.table,
      };

      incident = await insertFirstMatching(supabase, incidentTables, [
        {
          type: title,
          guest_message: description,
          priority: ai.priority,
          status: "open",
          notify_host: true,
          property_id: propertyContext?.propertyId,
        },
        {
          type: title,
          guest_message: description,
          priority: ai.priority,
          status: "open",
        },
        {
          type: "customer_support",
          guest_message: `${title}: ${description}`,
          priority: ai.priority,
          status: "open",
          notify_host: true,
        },
        {
          title,
        },
        {
          title,
          status: "open",
        },
        {
          title,
          priority: ai.priority,
        },
        {
          title,
          priority: ai.priority,
          status: "open",
        },
        {
          title: `${title}: ${description}`,
          priority: ai.priority,
          status: "open",
        },
        {
          title,
          description,
          priority: ai.priority,
          status: "open",
        },
        {
          title,
          description,
          status: "open",
        },
        {
          title,
          description,
        },
        {
          title,
          summary: description,
          severity: ai.priority,
          status: "open",
        },
        {
          title,
          summary: description,
          status: "open",
        },
        {
          title,
          description,
          priority: ai.priority,
          status: "open",
          customer_name: customerName,
          customer_email: customerEmail,
          metadata: incidentMetadata,
        },
        {
          title,
          summary: description,
          severity: ai.priority,
          status: "open",
          metadata: incidentMetadata,
        },
        {
          name: title,
          details: description,
          priority: ai.priority,
          status: "open",
          metadata: incidentMetadata,
        },
        {
          title,
          description,
          priority: ai.priority,
          status: "open",
          conversation_id: conversation.id,
          customer_name: customerName,
          customer_email: customerEmail,
          metadata: incidentMetadata,
        },
        {
          title,
          summary: description,
          severity: ai.priority,
          status: "open",
          conversation_id: conversation.id,
          metadata: incidentMetadata,
        },
        {
          name: title,
          details: description,
          priority: ai.priority,
          status: "open",
          conversation_id: conversation.id,
          metadata: incidentMetadata,
        },
      ]);

      await updateConversationIncident(
        supabase,
        conversation.table,
        conversation.id,
        incident.id
      );
    }

    return Response.json({
      success: true,
      reply: ai.reply,
      conversationId: conversation.id,
      conversationTable: conversation.table,
      incidentCreated: Boolean(incident),
      incidentId: incident?.id ?? null,
      incidentTable: incident?.table ?? null,
      priority: incident ? ai.priority : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat route error.";
    console.error(message);

    return Response.json({ error: message }, { status: 500 });
  }
}
