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
  restaurant_reservation: RestaurantReservationDraft | null;
};

type InsertResult = {
  id: string | null;
  table: string;
  data: Record<string, unknown> | null;
};

type QueryAnalytics = {
  category: string;
  intent: string;
  restaurants: string[];
  activities: string[];
  entities: string[];
};

type LiveWeather = {
  location: string;
  source: string;
  observedAt: string | null;
  temperatureC: number | null;
  windKmh: number | null;
  condition: string | null;
  forecast: Array<{
    date: string;
    minC: number | null;
    maxC: number | null;
    precipitationMm: number | null;
  }>;
};

type LocalEvent = {
  location: string | null;
  title: string | null;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  timeText: string | null;
  venue: string | null;
  description: string | null;
  price: string | null;
  registration: string | null;
};

type RestaurantMenuItem = {
  restaurantName: string | null;
  location: string | null;
  cuisine: string | null;
  averageCheckMinChf: number | null;
  averageCheckMaxChf: number | null;
  menuCategory: string | null;
  itemName: string | null;
  description: string | null;
  priceChf: number | null;
  priceText: string | null;
  dietaryTags: string | null;
  sourceUpdatedAt: string | null;
};

type RestaurantContact = {
  restaurantName: string | null;
  whatsappPhone: string | null;
  phone: string | null;
  email: string | null;
  acceptsWhatsappReservations: boolean;
  reservationNotes: string | null;
};

type RestaurantReservationDraft = {
  requested: boolean;
  readyToSend: boolean;
  restaurantName: string | null;
  reservationDate: string | null;
  reservationTime: string | null;
  partySize: number | null;
  guestName: string | null;
  guestContact: string | null;
  specialRequests: string | null;
  missingFields: string[];
};

type ReservationResult = {
  id: string | null;
  status: string;
  whatsappMessageId: string | null;
  guestNotice: string;
};

type LiveExchangeRates = {
  source: string;
  sourceUrl: string;
  checkedAt: string;
  rates: string[];
  note: string;
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
  localEvents: LocalEvent[];
  restaurantMenus: RestaurantMenuItem[];
  restaurantContacts: RestaurantContact[];
  liveWeather: LiveWeather | null;
  liveExchangeRates: LiveExchangeRates | null;
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

function asOptionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function asOptionalInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
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

function normalizeLookup(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractNamedMatches(
  text: string,
  candidates: Array<{ name: string; keywords: string[] }>
) {
  return candidates
    .filter((candidate) =>
      candidate.keywords.some((keyword) => text.includes(keyword))
    )
    .map((candidate) => candidate.name);
}

function classifyQuery(message: string): QueryAnalytics {
  const text = message.toLowerCase();
  const restaurants = extractNamedMatches(text, [
    { name: "Hannig", keywords: ["hannig", "ханниг"] },
    { name: "Schäferstube", keywords: ["schäferstube", "schaferstube"] },
    { name: "Zer Schlucht", keywords: ["zer schlucht", "zur schlucht", "schlucht"] },
    { name: "Brasserie 1809", keywords: ["brasserie 1809", "1809"] },
    { name: "The Capra", keywords: ["capra", "the capra"] },
    { name: "Walliserhof", keywords: ["walliserhof"] },
    { name: "Allalin", keywords: ["allalin", "алалин"] },
    { name: "Spielboden", keywords: ["spielboden"] },
    { name: "Morenia", keywords: ["morenia"] },
    { name: "Längfluh", keywords: ["längfluh", "langfluh"] },
    { name: "Hohsaas", keywords: ["hohsaas"] },
    { name: "Felskinn", keywords: ["felskinn"] },
    { name: "Gletschergrotte", keywords: ["gletschergrotte"] },
    { name: "Alpenblick", keywords: ["alpenblick"] },
    { name: "Almagelleralp", keywords: ["almagelleralp"] },
    { name: "Kreuzboden", keywords: ["kreuzboden"] },
    { name: "Furggstalden", keywords: ["furggstalden"] },
  ]);
  const activities = extractNamedMatches(text, [
    { name: "Hiking", keywords: ["hiking", "hike", "trail", "walk", "поход", "маршрут", "тропа"] },
    { name: "Biking", keywords: ["bike", "biking", "e-bike", "велосипед", "байк"] },
    { name: "Mountaincarts", keywords: ["mountaincart", "mountain cart"] },
    { name: "Feeblitz", keywords: ["feeblitz", "toboggan"] },
    { name: "Via ferrata", keywords: ["via ferrata", "феррата", "klettersteig"] },
    { name: "Glacier tour", keywords: ["glacier", "ледник", "глетчер"] },
    { name: "Husky trekking", keywords: ["husky", "хаски"] },
    { name: "Summer skiing", keywords: ["summer ski", "skiing", "ski", "лыжи"] },
    { name: "Marmots", keywords: ["marmot", "murmeli", "сурок", "сурки"] },
    { name: "Spielboden", keywords: ["spielboden"] },
    { name: "Kreuzboden", keywords: ["kreuzboden"] },
    { name: "Mattmark", keywords: ["mattmark"] },
    { name: "SaasFeestival", keywords: ["saasfeestival", "festival", "концерт"] },
    { name: "Wellness", keywords: ["wellness", "spa", "сауна", "спа"] },
    { name: "Aqua Allalin", keywords: ["aqua allalin", "pool", "swimming", "бассейн"] },
    { name: "Museums", keywords: ["museum", "museums", "музей"] },
  ]);

  let category = "other";
  if (
    includesAny(text, [
      "restaurant",
      "menu",
      "food",
      "eat",
      "lunch",
      "dinner",
      "fondue",
      "ресторан",
      "меню",
      "еда",
      "поесть",
      "обед",
      "ужин",
    ]) ||
    restaurants.length > 0
  ) {
    category = "restaurants";
  } else if (
    includesAny(text, [
      "activity",
      "activities",
      "things to do",
      "hiking",
      "bike",
      "trail",
      "ski",
      "event",
      "festival",
      "актив",
      "чем заняться",
      "мероприят",
      "событ",
      "маршрут",
    ]) ||
    activities.length > 0
  ) {
    category = "activities";
  } else if (includesAny(text, ["weather", "forecast", "погода", "прогноз"])) {
    category = "weather";
  } else if (includesAny(text, ["bus", "taxi", "parking", "car", "transport", "парков", "автобус", "такси"])) {
    category = "transport";
  } else if (includesAny(text, ["wifi", "wi-fi", "key", "check-in", "checkout", "apartment", "квартира", "ключ", "заезд", "выезд"])) {
    category = "property";
  } else if (includesAny(text, ["pharmacy", "doctor", "emergency", "аптек", "врач", "экстр", "больниц"])) {
    category = "health";
  } else if (includesAny(text, ["bank", "atm", "exchange", "currency", "банк", "банкомат", "обмен", "валют"])) {
    category = "banking";
  } else if (includesAny(text, ["grocery", "supermarket", "coop", "migros", "магазин", "продукт"])) {
    category = "groceries";
  }

  let intent = "general_question";
  if (includesAny(text, ["price", "cost", "how much", "цена", "стоимость", "сколько стоит"])) {
    intent = "price";
  } else if (includesAny(text, ["where", "address", "how to get", "directions", "где", "адрес", "как добраться"])) {
    intent = "location_directions";
  } else if (includesAny(text, ["open", "hours", "time", "when", "работает", "открыт", "время", "когда"])) {
    intent = "opening_hours";
  } else if (includesAny(text, ["recommend", "best", "which", "посовет", "лучше", "какой"])) {
    intent = "recommendation";
  } else if (includesAny(text, ["book", "reserve", "reservation", "заброни", "резерв"])) {
    intent = "booking";
  } else if (includesAny(text, ["menu", "dish", "eat", "food", "меню", "блюдо", "поесть"])) {
    intent = "menu_food";
  }

  return {
    category,
    intent,
    restaurants,
    activities,
    entities: unique([...restaurants, ...activities]),
  };
}

function parseOpenAIJson(content: string | null): ConciergeResponse {
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content) as Partial<ConciergeResponse>;
  const reservation =
    parsed.restaurant_reservation &&
    typeof parsed.restaurant_reservation === "object"
      ? (parsed.restaurant_reservation as Record<string, unknown>)
      : null;

  return {
    reply:
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Danke. Ich habe das aufgenommen und das Team wird es in Kürze prüfen.",
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
    restaurant_reservation: reservation
      ? {
          requested: asOptionalBoolean(reservation.requested),
          readyToSend: asOptionalBoolean(reservation.readyToSend),
          restaurantName: asOptionalString(reservation.restaurantName),
          reservationDate: asOptionalString(reservation.reservationDate),
          reservationTime: asOptionalString(reservation.reservationTime),
          partySize: asOptionalInteger(reservation.partySize),
          guestName: asOptionalString(reservation.guestName),
          guestContact: asOptionalString(reservation.guestContact),
          specialRequests: asOptionalString(reservation.specialRequests),
          missingFields: Array.isArray(reservation.missingFields)
            ? reservation.missingFields
                .map((item) => asOptionalString(item))
                .filter((item): item is string => Boolean(item))
            : [],
        }
      : null,
  };
}

function getWeatherDescription(code: number | null) {
  if (code === null) {
    return null;
  }

  const descriptions: Record<number, string> = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with slight hail",
    99: "thunderstorm with heavy hail",
  };

  return descriptions[code] ?? `weather code ${code}`;
}

function asNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function getLiveSaasFeeWeather(): Promise<LiveWeather | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "46.1082",
    longitude: "7.9274",
    timezone: "Europe/Zurich",
    current: "temperature_2m,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
    forecast_days: "4",
  }).toString();

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const current = data.current as Record<string, unknown> | undefined;
    const daily = data.daily as Record<string, unknown> | undefined;
    const dates = Array.isArray(daily?.time) ? daily.time : [];
    const min = Array.isArray(daily?.temperature_2m_min)
      ? daily.temperature_2m_min
      : [];
    const max = Array.isArray(daily?.temperature_2m_max)
      ? daily.temperature_2m_max
      : [];
    const precipitation = Array.isArray(daily?.precipitation_sum)
      ? daily.precipitation_sum
      : [];
    const weatherCode = asNullableNumber(current?.weather_code);

    return {
      location: "Saas-Fee, Switzerland",
      source: "Open-Meteo forecast API",
      observedAt: asOptionalString(current?.time),
      temperatureC: asNullableNumber(current?.temperature_2m),
      windKmh: asNullableNumber(current?.wind_speed_10m),
      condition: getWeatherDescription(weatherCode),
      forecast: dates.slice(0, 4).map((date, index) => ({
        date: String(date),
        minC: asNullableNumber(min[index]),
        maxC: asNullableNumber(max[index]),
        precipitationMm: asNullableNumber(precipitation[index]),
      })),
    };
  } catch (error) {
    console.error(
      `Could not load live Saas-Fee weather: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return null;
  }
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function getLiveExchangeRates(): Promise<LiveExchangeRates | null> {
  const sourceUrl =
    "https://www.erlebnisbank.ch/uber-uns/bankstellen/saas-fee";

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 Saas-Fee AI Concierge",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      throw new Error(`Erlebnisbank returned ${response.status}`);
    }

    const pageText = stripHtml(await response.text());
    const currencyPattern =
      /\b(?:EUR|USD|GBP|CHF|CAD|AUD|JPY|SEK|NOK|DKK)\b.{0,80}?(?:\d+[.,]\d{2,5})/gi;
    const rates = [...pageText.matchAll(currencyPattern)]
      .map((match) => match[0].replace(/\s+/g, " ").trim())
      .filter((line) => /(?:EUR|USD|GBP|CAD|AUD|JPY|SEK|NOK|DKK)/i.test(line))
      .slice(0, 12);

    return {
      source: "Raiffeisenbank Mischabel-Matterhorn Erlebnisbank Saas-Fee",
      sourceUrl,
      checkedAt: new Date().toISOString(),
      rates,
      note: rates.length
        ? "Rates were extracted from the bank page text. Confirm at the bank before exchanging cash."
        : "No machine-readable exchange-rate table was found on the bank page during this request. Do not invent rates.",
    };
  } catch (error) {
    console.error(
      `Could not load Erlebnisbank exchange rates: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return null;
  }
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
          "Default language is German. Write replies in German unless the guest clearly writes in another language; if the guest mixes languages or the language is ambiguous, reply in German.",
          "Do not translate German source text into English or Russian; preserve German place names, item names, and guest-facing wording where possible.",
          "Use the supplied property context as the source of truth. Never invent contact details.",
          "Answer with the concrete information available in propertyContext instead of sending the guest to another website.",
          "Do not include source links in normal replies unless the guest explicitly asks for a link, booking page, live status page, or official source.",
          "If several options fit, recommend 3-5 concrete choices and briefly explain who each option is good for.",
          "When mentioning restaurant names in replies, format each restaurant name in bold Markdown, for example **Hannig**.",
          "Property context has two layers: globalKnowledge and localRecommendations are general information; property details, contacts, instructions, and FAQ are local housing information.",
          "For event questions, use propertyContext.localEvents first. Mention dates, village/location, time, price or registration details when available. Do not recommend events whose endDate is before today.",
          "For restaurant menu and price questions, use propertyContext.restaurantMenus first. Mention the sourceUpdatedAt date when available, but phrase it in the reply language. If no menu price is present for a restaurant or dish, say in the reply language that the current menu price is not available in the chat data yet; never invent menu prices or average checks.",
          "For restaurant table reservation requests, collect restaurant name, date, time, party size, guest name, and guest phone or WhatsApp contact. Do not say the table is confirmed. Say it is a reservation request until the restaurant confirms.",
          "If reservation details are missing, ask a concise follow-up question in German by default.",
          "When the guest wants a restaurant reservation, include restaurant_reservation in the JSON. Use requested=true. Set readyToSend=true only when restaurantName, reservationDate as YYYY-MM-DD, reservationTime, partySize, guestName, and guestContact are all present. Otherwise set readyToSend=false and list missingFields.",
          "For weather questions, use propertyContext.liveWeather when it is available and mention that mountain weather can change quickly.",
          "For currency exchange questions, use propertyContext.liveExchangeRates when rates are present. If rates are missing, provide the bank address and explain that the live exchange-rate table is not available in chat right now; never invent exchange rates.",
          "Only use local housing information when propertyContext.localAccessGranted is true.",
          "If localAccessGranted is false and the guest asks about a specific apartment, access, Wi-Fi, host contact, or private housing instructions, ask them to open their guest-specific link.",
          "If the guest asks for WhatsApp, support contact, host contact, or how to reach the property team, provide the WhatsApp number from propertyContext only when localAccessGranted is true and whatsapp is available.",
          "If a fact is not present in propertyContext, say that you do not have it and offer to notify the host.",
          "Create incidents for broken heating, appliances, access issues, safety concerns, urgent maintenance, guest escalations, or anything requiring staff follow-up.",
          "Return only JSON with keys: reply, incident_required, incident_title, incident_description, priority, restaurant_reservation. Priority must be low, medium, high, or urgent. restaurant_reservation must be null unless the guest is asking to reserve a restaurant table.",
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
  const localEvents = await getLocalEvents(supabase);
  const restaurantMenus = await getRestaurantMenus(supabase);
  const restaurantContacts = await getRestaurantContacts(supabase);
  const [liveWeather, liveExchangeRates] = await Promise.all([
    getLiveSaasFeeWeather(),
    getLiveExchangeRates(),
  ]);
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
      localEvents,
      restaurantMenus,
      restaurantContacts,
      liveWeather,
      liveExchangeRates,
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
    localEvents,
    restaurantMenus,
    restaurantContacts,
    liveWeather,
    liveExchangeRates,
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
    .limit(300);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    category: asOptionalString(item.category),
    title: asOptionalString(item.title),
    content: asOptionalString(item.content),
  }));
}

async function getLocalEvents(supabase: SupabaseClient) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("local_events")
    .select(
      "location, title, category, start_date, end_date, time_text, venue, description, price, registration"
    )
    .eq("is_active", true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("start_date", { ascending: true, nullsFirst: false })
    .limit(30);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    location: asOptionalString(item.location),
    title: asOptionalString(item.title),
    category: asOptionalString(item.category),
    startDate: asOptionalString(item.start_date),
    endDate: asOptionalString(item.end_date),
    timeText: asOptionalString(item.time_text),
    venue: asOptionalString(item.venue),
    description: asOptionalString(item.description),
    price: asOptionalString(item.price),
    registration: asOptionalString(item.registration),
  }));
}

async function getRestaurantMenus(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("restaurant_menus")
    .select(
      "restaurant_name, location, cuisine, average_check_min_chf, average_check_max_chf, menu_category, item_name, description, price_chf, price_text, dietary_tags, source_updated_at"
    )
    .eq("is_active", true)
    .order("restaurant_name", { ascending: true })
    .order("menu_category", { ascending: true })
    .limit(120);

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    restaurantName: asOptionalString(item.restaurant_name),
    location: asOptionalString(item.location),
    cuisine: asOptionalString(item.cuisine),
    averageCheckMinChf: asNullableNumber(item.average_check_min_chf),
    averageCheckMaxChf: asNullableNumber(item.average_check_max_chf),
    menuCategory: asOptionalString(item.menu_category),
    itemName: asOptionalString(item.item_name),
    description: asOptionalString(item.description),
    priceChf: asNullableNumber(item.price_chf),
    priceText: asOptionalString(item.price_text),
    dietaryTags: asOptionalString(item.dietary_tags),
    sourceUpdatedAt: asOptionalString(item.source_updated_at),
  }));
}

async function getRestaurantContacts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("restaurant_contacts")
    .select(
      "restaurant_name, whatsapp_phone, phone, email, accepts_whatsapp_reservations, reservation_notes"
    )
    .eq("is_active", true)
    .limit(100);

  if (error || !data) {
    if (error && !isMissingTableError(error.message)) {
      console.error(`Could not load restaurant contacts: ${error.message}`);
    }
    return [];
  }

  return (data as Record<string, unknown>[]).map((item) => ({
    restaurantName: asOptionalString(item.restaurant_name),
    whatsappPhone: asOptionalString(item.whatsapp_phone),
    phone: asOptionalString(item.phone),
    email: asOptionalString(item.email),
    acceptsWhatsappReservations:
      item.accepts_whatsapp_reservations !== false,
    reservationNotes: asOptionalString(item.reservation_notes),
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

async function insertQueryAnalytics(
  supabase: SupabaseClient,
  conversationId: string | null,
  propertyId: string | null | undefined,
  guestMessage: string,
  assistantReply: string,
  analytics: QueryAnalytics
) {
  const { error } = await supabase.from("query_analytics").insert({
    conversation_id: conversationId,
    property_id: propertyId ?? null,
    category: analytics.category,
    intent: analytics.intent,
    guest_message: guestMessage,
    assistant_reply: assistantReply,
    detected_restaurants: analytics.restaurants,
    detected_activities: analytics.activities,
    detected_entities: analytics.entities,
  });

  if (error && !isMissingTableError(error.message)) {
    console.error(`Could not insert query analytics: ${error.message}`);
  }
}

function getReservationMissingFields(draft: RestaurantReservationDraft) {
  const missing = new Set(draft.missingFields);

  if (!draft.restaurantName) missing.add("restaurantName");
  if (!draft.reservationDate) missing.add("reservationDate");
  if (!draft.reservationTime) missing.add("reservationTime");
  if (!draft.partySize) missing.add("partySize");
  if (!draft.guestName) missing.add("guestName");
  if (!draft.guestContact) missing.add("guestContact");

  return [...missing];
}

function findRestaurantContact(
  contacts: RestaurantContact[],
  restaurantName: string
) {
  const normalized = normalizeLookup(restaurantName);

  if (!normalized) {
    return undefined;
  }

  return contacts.find((contact) => {
    const contactName = normalizeLookup(contact.restaurantName);

    return (
      Boolean(contactName) &&
      (contactName === normalized ||
        contactName.includes(normalized) ||
        normalized.includes(contactName))
    );
  });
}

function normalizeWhatsAppPhone(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned.slice(1);
  }

  return cleaned || null;
}

function getWhatsAppConfig() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0",
    templateName: process.env.WHATSAPP_RESERVATION_TEMPLATE_NAME,
    templateLanguage:
      process.env.WHATSAPP_RESERVATION_TEMPLATE_LANGUAGE || "de",
  };
}

function isWhatsAppConfigured() {
  const config = getWhatsAppConfig();
  return Boolean(config.accessToken && config.phoneNumberId);
}

function buildReservationMessage(
  draft: RestaurantReservationDraft,
  propertyContext: PropertyContext | null
) {
  return [
    "Guten Tag",
    "",
    "wir möchten eine Reservierungsanfrage senden:",
    "",
    `Restaurant: ${draft.restaurantName}`,
    `Datum: ${draft.reservationDate}`,
    `Uhrzeit: ${draft.reservationTime}`,
    `Personen: ${draft.partySize}`,
    `Name: ${draft.guestName}`,
    `Kontakt: ${draft.guestContact}`,
    propertyContext?.propertyName
      ? `Unterkunft: ${propertyContext.propertyName}`
      : null,
    draft.specialRequests
      ? `Besondere Wünsche: ${draft.specialRequests}`
      : "Besondere Wünsche: keine",
    "",
    "Bitte bestätigen Sie die Verfügbarkeit. Vielen Dank.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

async function sendWhatsAppReservationMessage(
  toPhone: string,
  draft: RestaurantReservationDraft,
  propertyContext: PropertyContext | null,
  body: string
) {
  const config = getWhatsAppConfig();

  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error(
      "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID."
    );
  }

  const url = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`;
  const payload = config.templateName
    ? {
        messaging_product: "whatsapp",
        to: toPhone,
        type: "template",
        template: {
          name: config.templateName,
          language: { code: config.templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: draft.restaurantName ?? "-" },
                { type: "text", text: draft.reservationDate ?? "-" },
                { type: "text", text: draft.reservationTime ?? "-" },
                { type: "text", text: String(draft.partySize ?? "-") },
                { type: "text", text: draft.guestName ?? "-" },
                { type: "text", text: draft.guestContact ?? "-" },
                { type: "text", text: propertyContext?.propertyName ?? "-" },
                { type: "text", text: draft.specialRequests ?? "-" },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: {
          preview_url: false,
          body,
        },
      };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  const responseText = await response.text();
  const data = responseText
    ? (JSON.parse(responseText) as Record<string, unknown>)
    : {};

  if (!response.ok) {
    const error = data.error as Record<string, unknown> | undefined;
    throw new Error(
      typeof error?.message === "string"
        ? error.message
        : `WhatsApp returned ${response.status}`
    );
  }

  const messages = Array.isArray(data.messages) ? data.messages : [];
  const firstMessage = messages[0] as Record<string, unknown> | undefined;

  return typeof firstMessage?.id === "string" ? firstMessage.id : null;
}

async function insertRestaurantReservation(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("restaurant_reservations")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error.message)) {
      console.error("restaurant_reservations table is missing.");
      return null;
    }

    throw new Error(`Could not insert restaurant reservation: ${error.message}`);
  }

  return asOptionalString((data as Record<string, unknown>).id);
}

async function updateConversationReply(
  supabase: SupabaseClient,
  table: string,
  conversationId: string | null,
  reply: string
) {
  if (!conversationId) {
    return;
  }

  const candidates = [
    { assistant_message: reply },
    { response: reply },
    { ai_response: reply },
    { output: reply },
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

async function handleRestaurantReservation(
  supabase: SupabaseClient,
  conversationId: string | null,
  propertyContext: PropertyContext | null,
  draft: RestaurantReservationDraft | null
): Promise<ReservationResult | null> {
  if (!draft?.requested) {
    return null;
  }

  const missingFields = getReservationMissingFields(draft);

  if (!draft.readyToSend || missingFields.length > 0) {
    return null;
  }

  const contact = findRestaurantContact(
    propertyContext?.restaurantContacts ?? [],
    draft.restaurantName ?? ""
  );
  const restaurantWhatsapp = normalizeWhatsAppPhone(contact?.whatsappPhone);
  const messageBody = buildReservationMessage(draft, propertyContext);
  let status = "requested";
  let whatsappMessageId: string | null = null;
  let whatsappError: string | null = null;
  let guestNotice = "";

  if (!contact || !contact.acceptsWhatsappReservations || !restaurantWhatsapp) {
    status = "needs_restaurant_contact";
    whatsappError =
      "Restaurant WhatsApp contact is missing or not enabled for reservations.";
    guestNotice = `Ich habe die Reservierungsanfrage vorbereitet, aber für **${draft.restaurantName}** ist noch kein WhatsApp-Kontakt für Reservierungen in der Datenbank hinterlegt. Die Anfrage wurde noch nicht an das Restaurant gesendet.`;
  } else if (!isWhatsAppConfigured()) {
    status = "pending_whatsapp_config";
    whatsappError = "WhatsApp Business Platform env vars are missing.";
    guestNotice = `Ich habe die Reservierungsanfrage vorbereitet, aber der WhatsApp-Versand ist noch nicht vollständig konfiguriert. Die Anfrage wurde noch nicht an **${draft.restaurantName}** gesendet.`;
  } else {
    try {
      whatsappMessageId = await sendWhatsAppReservationMessage(
        restaurantWhatsapp,
        draft,
        propertyContext,
        messageBody
      );
      status = "sent_to_restaurant";
      guestNotice = `Ich habe die Reservierungsanfrage per WhatsApp an **${draft.restaurantName}** gesendet. Wichtig: Die Reservierung ist erst verbindlich, wenn das Restaurant sie bestätigt.`;
    } catch (error) {
      status = "whatsapp_failed";
      whatsappError =
        error instanceof Error ? error.message : "Unknown WhatsApp error.";
      guestNotice = `Ich habe die Reservierungsanfrage gespeichert, aber der WhatsApp-Versand an **${draft.restaurantName}** ist fehlgeschlagen. Die Reservierung ist noch nicht bestätigt.`;
      console.error(`WhatsApp reservation send failed: ${whatsappError}`);
    }
  }

  const reservationId = await insertRestaurantReservation(supabase, {
    conversation_id: conversationId,
    property_id: propertyContext?.propertyId ?? null,
    restaurant_name: draft.restaurantName,
    restaurant_whatsapp: restaurantWhatsapp,
    guest_name: draft.guestName,
    guest_contact: draft.guestContact,
    party_size: draft.partySize,
    reservation_date: draft.reservationDate,
    reservation_time: draft.reservationTime,
    special_requests: draft.specialRequests,
    status,
    whatsapp_message_body: messageBody,
    whatsapp_message_id: whatsappMessageId,
    whatsapp_error: whatsappError,
  });

  return {
    id: reservationId,
    status,
    whatsappMessageId,
    guestNotice,
  };
}

function appendReservationNotice(reply: string, notice: string) {
  if (!notice || reply.includes(notice)) {
    return reply;
  }

  return `${reply}\n\n${notice}`;
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
    const analytics = classifyQuery(message);
    const metadata = {
      requestConversationId,
      customerName,
      customerEmail,
      context: payload.context ?? null,
      analytics,
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

    const reservation = await handleRestaurantReservation(
      supabase,
      conversation.id,
      propertyContext,
      ai.restaurant_reservation
    );
    const finalReply = reservation
      ? appendReservationNotice(ai.reply, reservation.guestNotice)
      : ai.reply;

    if (finalReply !== ai.reply) {
      await updateConversationReply(
        supabase,
        conversation.table,
        conversation.id,
        finalReply
      );
    }

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

    await insertQueryAnalytics(
      supabase,
      conversation.id,
      propertyContext?.propertyId,
      message,
      finalReply,
      analytics
    );

    return Response.json({
      success: true,
      reply: finalReply,
      conversationId: conversation.id,
      conversationTable: conversation.table,
      incidentCreated: Boolean(incident),
      incidentId: incident?.id ?? null,
      incidentTable: incident?.table ?? null,
      priority: incident ? ai.priority : null,
      reservationCreated: Boolean(reservation?.id),
      reservationId: reservation?.id ?? null,
      reservationStatus: reservation?.status ?? null,
      whatsappMessageId: reservation?.whatsappMessageId ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat route error.";
    console.error(message);

    return Response.json({ error: message }, { status: 500 });
  }
}
