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

type AccessMode = "public" | "apartment";

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
  sourceUrl: string | null;
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
  propertySlug: string | null;
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

function getAccessMode(context: Record<string, unknown> | null): AccessMode {
  const mode = asOptionalString(context?.accessMode);
  const hasLocalSelector = Boolean(
    asOptionalString(context?.propertySlug) ||
      asOptionalString(context?.propertyId) ||
      asOptionalString(context?.guestAccessToken) ||
      asOptionalString(context?.access)
  );

  if (mode === "apartment" || (!mode && hasLocalSelector)) {
    return "apartment";
  }

  return "public";
}

type ResponseLanguage = "German" | "English" | "Russian" | "French" | "Italian";

function getPreferredLanguage(payload: ChatRequest) {
  const context = getPayloadContext(payload);
  const rawLanguage =
    asOptionalString(context?.uiLanguage) ||
    asOptionalString(context?.browserLanguage) ||
    asOptionalString(context?.locale);
  const language = rawLanguage?.toLowerCase() ?? "";

  if (language.startsWith("de")) return "German";
  if (language.startsWith("ru")) return "Russian";
  if (language.startsWith("fr")) return "French";
  if (language.startsWith("it")) return "Italian";

  return "English";
}

function detectMessageLanguage(message: string): ResponseLanguage | null {
  const text = message.toLowerCase();

  if (/[а-яё]/i.test(message)) return "Russian";
  if (includesAny(text, ["bonjour", "merci", "réservation", "reservation", "prix", "où", "avec"])) {
    return "French";
  }
  if (includesAny(text, ["ciao", "grazie", "prenot", "prezzo", "dove", "ristorante"])) {
    return "Italian";
  }
  if (includesAny(text, ["hello", "hi", "please", "menu", "price", "where", "book", "reserve"])) {
    return "English";
  }
  if (includesAny(text, ["hallo", "guten", "bitte", "menü", "preis", "wo", "reserv", "buchen"])) {
    return "German";
  }

  return null;
}

function getResponseLanguage(message: string, payload: ChatRequest) {
  return detectMessageLanguage(message) ?? getPreferredLanguage(payload);
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

function getKnownRestaurantCandidates(propertyContext: PropertyContext | null) {
  return unique([
    ...(propertyContext?.restaurantContacts ?? [])
      .map((item) => item.restaurantName)
      .filter((item): item is string => Boolean(item)),
    ...(propertyContext?.restaurantMenus ?? [])
      .map((item) => item.restaurantName)
      .filter((item): item is string => Boolean(item)),
    "Hannig",
    "Allalin",
    "Spielboden",
    "Längfluh",
    "Langfluh",
    "Morenia",
    "Schäferstube",
    "Schaferstube",
    "Zer Schlucht",
    "Brasserie 1809",
    "The Capra",
    "Walliserhof",
    "Zur Mühle",
    "Zur Muehle",
  ]);
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
    { name: "Zur Mühle", keywords: ["zur mühle", "zur muehle", "mühle", "muehle"] },
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
  } else if (includesAny(text, ["toilet", "toilets", "wc", "restroom", "bathroom", "toilette", "toiletten", "туалет"])) {
    category = "public_toilets";
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
  propertyContext: PropertyContext | null,
  responseLanguage: ResponseLanguage
): Promise<ConciergeResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const preferredLanguage = getPreferredLanguage(payload);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a concise Saas-Fee guest AI concierge for a holiday rental.",
          `Reply in ${responseLanguage}. This is the detected language of the guest's latest message; if detection was ambiguous, it falls back to the browser/preferred language: ${preferredLanguage}.`,
          "Preserve official place names, restaurant names, dish names, addresses, and other source wording where translation would make them less accurate.",
          "Use the supplied property context as the source of truth. Never invent contact details.",
          "Answer with the concrete information available in propertyContext instead of sending the guest to another website.",
          "Do not include source links in normal replies unless the guest explicitly asks for a link, booking page, live status page, or official source.",
          "If several options fit, recommend 3-5 concrete choices and briefly explain who each option is good for.",
          "When mentioning restaurant names in replies, format each restaurant name in bold Markdown, for example **Hannig**.",
          "Property context has two layers: globalKnowledge and localRecommendations are general information; property details, contacts, instructions, and FAQ are local housing information.",
          "For event questions, use propertyContext.localEvents first. Mention dates, village/location, time, price or registration details when available. Do not recommend events whose endDate is before today.",
          "For restaurant menu and price questions, use propertyContext.restaurantMenus first. Give a concise summary with the most relevant dishes/prices, and when a sourceUrl is available include one Markdown link to the full PDF menu, for example [PDF-Menü ansehen](https://example.com/menu.pdf). Mention the sourceUpdatedAt date when available, but phrase it in the reply language. If no menu price is present for a restaurant or dish, say in the reply language that the current menu price is not available in the chat data yet; never invent menu prices or average checks.",
          "For restaurant table reservation requests, collect restaurant name, date, time, party size, guest name, and guest phone or WhatsApp contact. Do not say the table is confirmed. Say it is a reservation request until the restaurant confirms.",
          "If reservation details are missing, ask a concise follow-up question in the reply language.",
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
          preferredLanguage,
          responseLanguage,
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
  requestedPropertySlug: string | null,
  guestAccessToken: string | null,
  accessMode: AccessMode
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
  const propertyId =
    accessMode === "apartment"
      ? await resolvePropertyId(
          supabase,
          requestedPropertyId,
          requestedPropertySlug,
          guestAccessToken
        )
      : null;

  if (!propertyId) {
    return {
      propertyId: null,
      propertySlug: null,
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
      "id, slug, name, address, property_contacts(host_name, whatsapp, emergency_medical, police, fire, taxi)"
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
    propertySlug: asOptionalString(property.slug),
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
  requestedPropertySlug: string | null,
  guestAccessToken: string | null
) {
  if (!guestAccessToken) {
    return null;
  }

  const tokenHash = hashAccessToken(guestAccessToken);
  const { data, error } = await supabase
    .from("guest_property_access")
    .select("property_id, active, valid_from, valid_until")
    .eq("access_token_hash", tokenHash)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const access = data as Record<string, unknown>;
  const now = Date.now();
  const validFrom = asOptionalString(access.valid_from);
  const validUntil = asOptionalString(access.valid_until);
  const startsOk = !validFrom || Date.parse(validFrom) <= now;
  const endsOk = !validUntil || Date.parse(validUntil) >= now;
  const propertyId = asOptionalString(access.property_id);

  if (!startsOk || !endsOk || !propertyId) {
    return null;
  }

  if (requestedPropertyId && requestedPropertyId !== propertyId) {
    return null;
  }

  if (requestedPropertySlug) {
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("id, slug")
      .eq("id", propertyId)
      .eq("slug", requestedPropertySlug)
      .limit(1)
      .maybeSingle();

    if (propertyError || !propertyData) {
      return null;
    }
  }

  return propertyId;
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
      "restaurant_name, location, cuisine, average_check_min_chf, average_check_max_chf, menu_category, item_name, description, price_chf, price_text, dietary_tags, source_url, source_updated_at"
    )
    .eq("is_active", true)
    .order("restaurant_name", { ascending: true })
    .order("menu_category", { ascending: true })
    .limit(500);

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
    sourceUrl: asOptionalString(item.source_url),
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
  const provider = (
    process.env.WHATSAPP_PROVIDER ||
    (process.env.TWILIO_ACCOUNT_SID ? "twilio" : "meta")
  ).toLowerCase();

  return {
    provider,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0",
    templateName: process.env.WHATSAPP_RESERVATION_TEMPLATE_NAME,
    templateLanguage:
      process.env.WHATSAPP_RESERVATION_TEMPLATE_LANGUAGE || "de",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM,
    twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    twilioReservationContentSid: process.env.TWILIO_RESERVATION_CONTENT_SID,
  };
}

function isWhatsAppConfigured() {
  const config = getWhatsAppConfig();

  if (config.provider === "twilio") {
    return Boolean(
      config.twilioAccountSid &&
        config.twilioAuthToken &&
        (config.twilioWhatsAppFrom || config.twilioMessagingServiceSid)
    );
  }

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

function formatTwilioWhatsAppAddress(phone: string) {
  if (phone.startsWith("whatsapp:")) {
    return phone;
  }

  const normalized = normalizeWhatsAppPhone(phone);
  return normalized ? `whatsapp:+${normalized}` : null;
}

function getTwilioReservationContentVariables(
  draft: RestaurantReservationDraft,
  propertyContext: PropertyContext | null,
  reservationId: string | null
) {
  return {
    "1": draft.restaurantName ?? "-",
    "2": draft.reservationDate ?? "-",
    "3": draft.reservationTime ?? "-",
    "4": String(draft.partySize ?? "-"),
    "5": draft.guestName ?? "-",
    "6": draft.guestContact ?? "-",
    "7": propertyContext?.propertyName ?? "-",
    "8": draft.specialRequests ?? "-",
    "9": reservationId ?? "-",
  };
}

async function sendMetaWhatsAppReservationMessage(
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

async function sendTwilioWhatsAppReservationMessage(
  toPhone: string,
  draft: RestaurantReservationDraft,
  propertyContext: PropertyContext | null,
  body: string,
  reservationId: string | null
) {
  const config = getWhatsAppConfig();

  if (!config.twilioAccountSid || !config.twilioAuthToken) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.");
  }

  if (!config.twilioWhatsAppFrom && !config.twilioMessagingServiceSid) {
    throw new Error(
      "Missing TWILIO_WHATSAPP_FROM or TWILIO_MESSAGING_SERVICE_SID."
    );
  }

  const to = formatTwilioWhatsAppAddress(toPhone);

  if (!to) {
    throw new Error("Invalid restaurant WhatsApp phone number.");
  }

  const params = new URLSearchParams();
  params.set("To", to);

  if (config.twilioMessagingServiceSid) {
    params.set("MessagingServiceSid", config.twilioMessagingServiceSid);
  } else if (config.twilioWhatsAppFrom) {
    const from = formatTwilioWhatsAppAddress(config.twilioWhatsAppFrom);

    if (!from) {
      throw new Error("Invalid TWILIO_WHATSAPP_FROM.");
    }

    params.set("From", from);
  }

  if (config.twilioReservationContentSid) {
    params.set("ContentSid", config.twilioReservationContentSid);
    params.set(
      "ContentVariables",
      JSON.stringify(
        getTwilioReservationContentVariables(
          draft,
          propertyContext,
          reservationId
        )
      )
    );
  } else {
    params.set("Body", body);
  }

  const auth = Buffer.from(
    `${config.twilioAccountSid}:${config.twilioAuthToken}`
  ).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      signal: AbortSignal.timeout(8000),
    }
  );
  const responseText = await response.text();
  const data = responseText
    ? (JSON.parse(responseText) as Record<string, unknown>)
    : {};

  if (!response.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : `Twilio returned ${response.status}`;
    const code = typeof data.code === "number" ? ` (${data.code})` : "";
    throw new Error(`${message}${code}`);
  }

  return typeof data.sid === "string" ? data.sid : null;
}

async function sendWhatsAppReservationMessage(
  toPhone: string,
  draft: RestaurantReservationDraft,
  propertyContext: PropertyContext | null,
  body: string,
  reservationId: string | null
) {
  const config = getWhatsAppConfig();

  if (config.provider === "twilio") {
    return sendTwilioWhatsAppReservationMessage(
      toPhone,
      draft,
      propertyContext,
      body,
      reservationId
    );
  }

  return sendMetaWhatsAppReservationMessage(
    toPhone,
    draft,
    propertyContext,
    body
  );
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

async function updateRestaurantReservation(
  supabase: SupabaseClient,
  reservationId: string | null,
  payload: Record<string, unknown>
) {
  if (!reservationId) {
    return;
  }

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (error && !isMissingTableError(error.message)) {
    throw new Error(`Could not update restaurant reservation: ${error.message}`);
  }
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

function reservationNotice(
  language: ResponseLanguage,
  key:
    | "missingFields"
    | "missingRestaurantContact"
    | "missingWhatsAppConfig"
    | "sent"
    | "failed",
  restaurantName?: string | null
) {
  const restaurant = restaurantName ? `**${restaurantName}**` : "restaurant";
  const notices: Record<ResponseLanguage, Record<typeof key, string>> = {
    German: {
      missingFields:
        "Ich habe Ihre Reservierungsanfrage aufgenommen, brauche aber noch fehlende Angaben, bevor ich sie an das Restaurant senden kann.",
      missingRestaurantContact: `Ich habe die Reservierungsanfrage vorbereitet, aber für ${restaurant} ist noch kein WhatsApp-Kontakt für Reservierungen in der Datenbank hinterlegt. Die Anfrage wurde noch nicht an das Restaurant gesendet.`,
      missingWhatsAppConfig: `Ich habe die Reservierungsanfrage vorbereitet, aber der WhatsApp-Versand ist noch nicht vollständig konfiguriert. Die Anfrage wurde noch nicht an ${restaurant} gesendet.`,
      sent: `Ich habe die Reservierungsanfrage per WhatsApp an ${restaurant} gesendet. Wichtig: Die Reservierung ist erst verbindlich, wenn das Restaurant sie bestätigt.`,
      failed: `Ich habe die Reservierungsanfrage gespeichert, aber der WhatsApp-Versand an ${restaurant} ist fehlgeschlagen. Die Reservierung ist noch nicht bestätigt.`,
    },
    English: {
      missingFields:
        "I have recorded your reservation request, but I still need a few missing details before I can send it to the restaurant.",
      missingRestaurantContact: `I prepared the reservation request, but there is no WhatsApp reservation contact for ${restaurant} in the database yet. The request has not been sent to the restaurant.`,
      missingWhatsAppConfig: `I prepared the reservation request, but WhatsApp sending is not fully configured yet. The request has not been sent to ${restaurant}.`,
      sent: `I sent the reservation request to ${restaurant} via WhatsApp. Important: the reservation is only binding once the restaurant confirms it.`,
      failed: `I saved the reservation request, but WhatsApp sending to ${restaurant} failed. The reservation is not confirmed yet.`,
    },
    Russian: {
      missingFields:
        "Я записал запрос на бронирование, но мне нужны недостающие данные, прежде чем отправить его в ресторан.",
      missingRestaurantContact: `Я подготовил запрос на бронирование, но для ${restaurant} ещё нет WhatsApp-контакта для бронирований в базе. Запрос пока не отправлен в ресторан.`,
      missingWhatsAppConfig: `Я подготовил запрос на бронирование, но отправка WhatsApp ещё не настроена полностью. Запрос пока не отправлен в ${restaurant}.`,
      sent: `Я отправил запрос на бронирование в ${restaurant} через WhatsApp. Важно: бронь станет действительной только после подтверждения ресторана.`,
      failed: `Я сохранил запрос на бронирование, но отправка WhatsApp в ${restaurant} не удалась. Бронь пока не подтверждена.`,
    },
    French: {
      missingFields:
        "J'ai enregistré votre demande de réservation, mais il manque encore quelques informations avant de pouvoir l'envoyer au restaurant.",
      missingRestaurantContact: `J'ai préparé la demande de réservation, mais aucun contact WhatsApp pour les réservations de ${restaurant} n'est encore enregistré dans la base. La demande n'a pas été envoyée au restaurant.`,
      missingWhatsAppConfig: `J'ai préparé la demande de réservation, mais l'envoi WhatsApp n'est pas encore entièrement configuré. La demande n'a pas été envoyée à ${restaurant}.`,
      sent: `J'ai envoyé la demande de réservation à ${restaurant} via WhatsApp. Important : la réservation n'est définitive qu'après confirmation du restaurant.`,
      failed: `J'ai enregistré la demande de réservation, mais l'envoi WhatsApp à ${restaurant} a échoué. La réservation n'est pas encore confirmée.`,
    },
    Italian: {
      missingFields:
        "Ho registrato la richiesta di prenotazione, ma mi servono ancora alcuni dati prima di inviarla al ristorante.",
      missingRestaurantContact: `Ho preparato la richiesta di prenotazione, ma nel database non c'è ancora un contatto WhatsApp per le prenotazioni di ${restaurant}. La richiesta non è stata inviata al ristorante.`,
      missingWhatsAppConfig: `Ho preparato la richiesta di prenotazione, ma l'invio WhatsApp non è ancora configurato completamente. La richiesta non è stata inviata a ${restaurant}.`,
      sent: `Ho inviato la richiesta di prenotazione a ${restaurant} via WhatsApp. Importante: la prenotazione è vincolante solo dopo la conferma del ristorante.`,
      failed: `Ho salvato la richiesta di prenotazione, ma l'invio WhatsApp a ${restaurant} non è riuscito. La prenotazione non è ancora confermata.`,
    },
  };

  return notices[language][key];
}

async function handleRestaurantReservation(
  supabase: SupabaseClient,
  conversationId: string | null,
  propertyContext: PropertyContext | null,
  draft: RestaurantReservationDraft | null,
  language: ResponseLanguage
): Promise<ReservationResult | null> {
  if (!draft?.requested) {
    return null;
  }

  const missingFields = getReservationMissingFields(draft);

  if (!draft.readyToSend || missingFields.length > 0) {
    const messageBody = buildReservationMessage(draft, propertyContext);
    const reservationId = await insertRestaurantReservation(supabase, {
      conversation_id: conversationId,
      property_id: propertyContext?.propertyId ?? null,
      restaurant_name: draft.restaurantName ?? "Unbekannt",
      restaurant_whatsapp: null,
      guest_name: draft.guestName,
      guest_contact: draft.guestContact,
      party_size: draft.partySize,
      reservation_date: draft.reservationDate,
      reservation_time: draft.reservationTime,
      special_requests: draft.specialRequests,
      status: "requested",
      whatsapp_message_body: messageBody,
      whatsapp_message_id: null,
      whatsapp_error: `Missing reservation fields: ${missingFields.join(", ")}`,
    });

    return {
      id: reservationId,
      status: "requested",
      whatsappMessageId: null,
      guestNotice: reservationNotice(language, "missingFields"),
    };
  }

  const contact = findRestaurantContact(
    propertyContext?.restaurantContacts ?? [],
    draft.restaurantName ?? ""
  );
  const restaurantWhatsapp = normalizeWhatsAppPhone(contact?.whatsappPhone);
  const messageBody = buildReservationMessage(draft, propertyContext);
  const baseReservationPayload = {
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
    whatsapp_message_body: messageBody,
  };
  let whatsappMessageId: string | null = null;
  let whatsappError: string | null = null;
  let guestNotice = "";

  if (!contact || !contact.acceptsWhatsappReservations || !restaurantWhatsapp) {
    whatsappError =
      "Restaurant WhatsApp contact is missing or not enabled for reservations.";
    guestNotice = reservationNotice(
      language,
      "missingRestaurantContact",
      draft.restaurantName
    );
    const reservationId = await insertRestaurantReservation(supabase, {
      ...baseReservationPayload,
      status: "needs_restaurant_contact",
      whatsapp_message_id: null,
      whatsapp_error: whatsappError,
    });

    return {
      id: reservationId,
      status: "needs_restaurant_contact",
      whatsappMessageId: null,
      guestNotice,
    };
  } else if (!isWhatsAppConfigured()) {
    whatsappError = "WhatsApp Business Platform env vars are missing.";
    guestNotice = reservationNotice(
      language,
      "missingWhatsAppConfig",
      draft.restaurantName
    );
    const reservationId = await insertRestaurantReservation(supabase, {
      ...baseReservationPayload,
      status: "pending_whatsapp_config",
      whatsapp_message_id: null,
      whatsapp_error: whatsappError,
    });

    return {
      id: reservationId,
      status: "pending_whatsapp_config",
      whatsappMessageId: null,
      guestNotice,
    };
  }

  const reservationId = await insertRestaurantReservation(supabase, {
    ...baseReservationPayload,
    status: "requested",
    whatsapp_message_id: null,
    whatsapp_error: null,
  });

  try {
    whatsappMessageId = await sendWhatsAppReservationMessage(
      restaurantWhatsapp,
      draft,
      propertyContext,
      messageBody,
      reservationId
    );
    await updateRestaurantReservation(supabase, reservationId, {
      status: "sent_to_restaurant",
      whatsapp_message_id: whatsappMessageId,
      whatsapp_error: null,
    });
    guestNotice = reservationNotice(language, "sent", draft.restaurantName);
  } catch (error) {
    whatsappError =
      error instanceof Error ? error.message : "Unknown WhatsApp error.";
    await updateRestaurantReservation(supabase, reservationId, {
      status: "whatsapp_failed",
      whatsapp_message_id: whatsappMessageId,
      whatsapp_error: whatsappError,
    });
    guestNotice = reservationNotice(language, "failed", draft.restaurantName);
    console.error(`WhatsApp reservation send failed: ${whatsappError}`);
  }

  return {
    id: reservationId,
    status: whatsappError ? "whatsapp_failed" : "sent_to_restaurant",
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

function isReservationRequest(message: string) {
  const text = message.toLowerCase();

  return includesAny(text, [
    "reserviere",
    "reservieren",
    "reservierung",
    "tisch",
    "reservation",
    "reserve",
    "book",
    "table",
    "заброни",
    "резерв",
    "столик",
  ]);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseReservationDate(message: string) {
  const text = message.toLowerCase();

  if (includesAny(text, ["übermorgen", "uebermorgen", "day after tomorrow"])) {
    return addDaysIso(2);
  }

  if (includesAny(text, ["morgen", "tomorrow", "завтра"])) {
    return addDaysIso(1);
  }

  if (includesAny(text, ["heute", "today", "сегодня"])) {
    return addDaysIso(0);
  }

  const isoMatch = message.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  const dottedMatch = message.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](20\d{2}))?\b/);
  if (dottedMatch) {
    const day = dottedMatch[1].padStart(2, "0");
    const month = dottedMatch[2].padStart(2, "0");
    const year = dottedMatch[3] ?? String(new Date().getFullYear());
    return `${year}-${month}-${day}`;
  }

  return null;
}

function parseReservationTime(message: string) {
  const timeMatch = message.match(/\b(?:um\s*)?([01]?\d|2[0-3])[:.](\d{2})\b/i);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
  }

  const hourMatch = message.match(/\b(?:um\s*)?([01]?\d|2[0-3])\s*(?:uhr|h)\b/i);
  if (hourMatch) {
    return `${hourMatch[1].padStart(2, "0")}:00`;
  }

  return null;
}

function parsePartySize(message: string) {
  const numericMatch = message.match(
    /\b(?:für|for|на)?\s*(\d{1,2})\s*(?:personen|person|people|gäste|gaste|persons|человек|гост)/i
  );

  if (numericMatch) {
    return Number(numericMatch[1]);
  }

  const words: Record<string, number> = {
    eins: 1,
    eine: 1,
    einer: 1,
    zwei: 2,
    drei: 3,
    vier: 4,
    fünf: 5,
    fuenf: 5,
    sechs: 6,
    sieben: 7,
    acht: 8,
    neun: 9,
    zehn: 10,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  const text = normalizeLookup(message);

  for (const [word, value] of Object.entries(words)) {
    if (text.includes(`${word} personen`) || text.includes(`fur ${word}`)) {
      return value;
    }
  }

  return null;
}

function parseGuestContact(message: string) {
  const phoneMatch = message.match(/\+?\d[\d\s().-]{7,}\d/);
  if (phoneMatch) {
    return phoneMatch[0].trim();
  }

  const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch?.[0] ?? null;
}

function parseGuestName(message: string) {
  const namePatterns = [
    /(?:mein name ist|name ist|ich heiße|ich heisse)\s+([^.,\n]+)/i,
    /(?:my name is|name is)\s+([^.,\n]+)/i,
    /(?:меня зовут|имя)\s+([^.,\n]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    const value = asOptionalString(match?.[1]);

    if (value) {
      return value;
    }
  }

  return null;
}

function parseRestaurantName(
  message: string,
  propertyContext: PropertyContext | null
) {
  const normalizedMessage = normalizeLookup(message);

  return (
    getKnownRestaurantCandidates(propertyContext).find((name) =>
      normalizedMessage.includes(normalizeLookup(name))
    ) ?? null
  );
}

function localReservationDraft(
  message: string,
  propertyContext: PropertyContext | null,
  customerName: string | null,
  customerEmail: string | null
): RestaurantReservationDraft | null {
  if (!isReservationRequest(message)) {
    return null;
  }

  const draft: RestaurantReservationDraft = {
    requested: true,
    readyToSend: false,
    restaurantName: parseRestaurantName(message, propertyContext),
    reservationDate: parseReservationDate(message),
    reservationTime: parseReservationTime(message),
    partySize: parsePartySize(message),
    guestName: parseGuestName(message) ?? customerName,
    guestContact: parseGuestContact(message) ?? customerEmail,
    specialRequests: null,
    missingFields: [],
  };
  const missingFields = getReservationMissingFields(draft);

  return {
    ...draft,
    readyToSend: missingFields.length === 0,
    missingFields,
  };
}

function mergeReservationDrafts(
  primary: RestaurantReservationDraft | null,
  fallback: RestaurantReservationDraft | null
) {
  if (!primary?.requested) {
    return fallback;
  }

  if (!fallback) {
    return primary;
  }

  const merged: RestaurantReservationDraft = {
    requested: true,
    readyToSend: false,
    restaurantName: primary.restaurantName ?? fallback.restaurantName,
    reservationDate: primary.reservationDate ?? fallback.reservationDate,
    reservationTime: primary.reservationTime ?? fallback.reservationTime,
    partySize: primary.partySize ?? fallback.partySize,
    guestName: primary.guestName ?? fallback.guestName,
    guestContact: primary.guestContact ?? fallback.guestContact,
    specialRequests: primary.specialRequests ?? fallback.specialRequests,
    missingFields: unique([
      ...primary.missingFields,
      ...fallback.missingFields,
    ]),
  };
  const missingFields = getReservationMissingFields(merged);

  return {
    ...merged,
    readyToSend: missingFields.length === 0,
    missingFields,
  };
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
    const accessMode = getAccessMode(requestContext);
    const responseLanguage = getResponseLanguage(message, payload);
    const requestPropertyId = asOptionalString(requestContext?.propertyId);
    const requestPropertySlug = asOptionalString(requestContext?.propertySlug);
    const guestAccessToken =
      asOptionalString(requestContext?.guestAccessToken) ||
      asOptionalString(requestContext?.access);
    const propertyContext = await getPropertyContext(
      supabase,
      requestPropertyId,
      requestPropertySlug,
      guestAccessToken,
      accessMode
    );
    const ai = await getConciergeResponse(
      message,
      payload,
      propertyContext,
      responseLanguage
    );
    const reservationDraft = mergeReservationDrafts(
      ai.restaurant_reservation,
      localReservationDraft(
        message,
        propertyContext,
        customerName,
        customerEmail
      )
    );
    const analytics = classifyQuery(message);
    const metadata = {
      requestConversationId,
      accessMode,
      customerName,
      customerEmail,
      responseLanguage,
      context: payload.context ?? null,
      analytics,
      reservationDraft,
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
      reservationDraft,
      responseLanguage
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
