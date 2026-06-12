"use client";

import {
  FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

type ChatResponse = {
  success?: boolean;
  reply?: string;
  conversationId?: string;
  incidentCreated?: boolean;
  incidentId?: string | null;
  priority?: string | null;
  error?: string;
};

type GuestContextResponse = {
  propertyId?: string | null;
  propertyName?: string | null;
  localAccessGranted?: boolean;
  error?: string;
};

const RESTAURANT_ACTIONS = [
  { name: "Hannig", aliases: ["Hannig", "Ханниг"] },
  { name: "Allalin", aliases: ["Allalin", "Алалин"] },
  { name: "Spielboden", aliases: ["Spielboden"] },
  { name: "Längfluh", aliases: ["Längfluh", "Langfluh"] },
  { name: "Morenia", aliases: ["Morenia"] },
  { name: "Schäferstube", aliases: ["Schäferstube", "Schaferstube"] },
  { name: "Zer Schlucht", aliases: ["Zer Schlucht", "Zur Schlucht"] },
  { name: "Brasserie 1809", aliases: ["Brasserie 1809"] },
  { name: "The Capra", aliases: ["The Capra", "Capra"] },
  { name: "Walliserhof", aliases: ["Walliserhof"] },
  { name: "Zur Mühle", aliases: ["Zur Mühle", "Zur Muehle", "Mühle", "Muehle"] },
  { name: "Hohsaas", aliases: ["Hohsaas"] },
  { name: "Felskinn", aliases: ["Felskinn"] },
  { name: "Gletschergrotte", aliases: ["Gletschergrotte"] },
  { name: "Alpenblick", aliases: ["Alpenblick"] },
  { name: "Almagelleralp", aliases: ["Almagelleralp"] },
  { name: "Kreuzboden", aliases: ["Kreuzboden"] },
  { name: "Furggstalden", aliases: ["Furggstalden"] },
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRestaurantByAlias(value: string) {
  const normalized = value.toLowerCase();

  return RESTAURANT_ACTIONS.find((restaurant) =>
    restaurant.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
}

function getAssistantTokenMatcher() {
  const aliases = RESTAURANT_ACTIONS.flatMap((restaurant) => restaurant.aliases)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex);

  return new RegExp(
    `\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)|(\\*\\*)?(${aliases.join(
      "|"
    )})(\\*\\*)?`,
    "giu"
  );
}

function getVisitorErrorMessage(message: string) {
  if (
    message.includes("Missing Supabase") ||
    message.includes("Missing OPENAI") ||
    message.includes("env vars")
  ) {
    return "Der Concierge ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.";
  }

  return message;
}

function getGuestContextFromUrl() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("propertyId") || undefined;
  const guestAccessToken =
    params.get("access") || params.get("guestAccessToken") || undefined;

  return { propertyId, guestAccessToken };
}

function getWelcomeMessage(propertyName?: string | null) {
  if (propertyName) {
    return `Willkommen in ${propertyName}. Ich bin Ihr KI-Concierge für Saas-Fee. Fragen Sie mich gerne zur Unterkunft, zu Restaurants, Aktivitäten, Bergbahnen, Wetter oder allem, was Sie während Ihres Aufenthalts brauchen.`;
  }

  return "Guten Tag, ich bin Ihr KI-Concierge für Saas-Fee. Fragen Sie mich gerne zu Restaurants, Aktivitäten, Bergbahnen, Wetter oder allem, was Sie während Ihres Aufenthalts brauchen.";
}

function MessageContent({
  content,
  isAssistant,
  isSending,
  onRestaurantClick,
}: {
  content: string;
  isAssistant: boolean;
  isSending: boolean;
  onRestaurantClick: (restaurantName: string) => void;
}) {
  if (!isAssistant) {
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  }

  const matcher = getAssistantTokenMatcher();
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(matcher)) {
    const matchIndex = match.index ?? 0;
    const linkText = match[1];
    const linkUrl = match[2];
    const alias = match[4];
    const restaurant = alias ? getRestaurantByAlias(alias) : undefined;

    if (!restaurant && (!linkText || !linkUrl)) {
      continue;
    }

    if (matchIndex > lastIndex) {
      nodes.push(content.slice(lastIndex, matchIndex));
    }

    if (linkText && linkUrl) {
      nodes.push(
        <a
          className="font-semibold text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d]"
          href={linkUrl}
          key={`${linkUrl}-${matchIndex}`}
          rel="noreferrer"
          target="_blank"
        >
          {linkText}
        </a>
      );
    } else if (restaurant) {
      nodes.push(
        <button
          className="inline rounded-sm font-semibold text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d] disabled:cursor-wait disabled:opacity-60"
          disabled={isSending}
          key={`${restaurant.name}-${matchIndex}`}
          onClick={() => onRestaurantClick(restaurant.name)}
          title={`Menü und Preise anzeigen: ${restaurant.name}`}
          type="button"
        >
          {restaurant.name}
        </button>
      );
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return <p className="whitespace-pre-wrap break-words">{nodes}</p>;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeMessage(),
    },
  ]);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestContext] = useState<{
    propertyId?: string;
    guestAccessToken?: string;
  }>(() => getGuestContextFromUrl());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = useMemo(
    () => message.trim().length > 0 && !isSending,
    [isSending, message]
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (guestContext.propertyId) {
      params.set("propertyId", guestContext.propertyId);
    }

    if (guestContext.guestAccessToken) {
      params.set("access", guestContext.guestAccessToken);
    }

    fetch(`/api/guest-context${params.size ? `?${params}` : ""}`)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as GuestContextResponse;
      })
      .then((data) => {
        const loadedPropertyName = data?.propertyName?.trim();

        if (!loadedPropertyName) {
          return;
        }

        setPropertyName(loadedPropertyName);
        setMessages((current) =>
          current.map((item) =>
            item.id === "welcome"
              ? { ...item, content: getWelcomeMessage(loadedPropertyName) }
              : item
          )
        );
      })
      .catch((loadError) => {
        console.error(
          loadError instanceof Error
            ? loadError.message
            : "Could not load guest context."
        );
      });
  }, [guestContext]);

  async function sendChatMessage(text: string) {
    if (!text || isSending) {
      return;
    }

    setError(null);
    setIsSending(true);
    setMessage("");

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          customerName: customerName.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          context: {
            source: "website-chat",
            ...guestContext,
          },
        }),
      });

      const responseText = await response.text();
      let data: ChatResponse;

      try {
        data = responseText ? (JSON.parse(responseText) as ChatResponse) : {};
      } catch {
        data = {
          error:
            "Der Concierge hat eine unerwartete Antwort zurückgegeben. Bitte versuchen Sie es erneut.",
        };
      }

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Der Concierge ist im Moment nicht verfügbar."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            data.reply ||
            "Danke. Ich habe Ihre Nachricht aufgenommen und das Team wird sie in Kürze prüfen.",
          meta: data.incidentCreated
            ? `Vorgang ${data.incidentId ?? "erstellt"}${
                data.priority ? `, Priorität: ${data.priority}` : ""
              }`
            : data.conversationId
              ? `Konversation ${data.conversationId}`
              : undefined,
        },
      ]);
    } catch (sendError) {
      const errorMessage =
        sendError instanceof Error
          ? sendError.message
          : "Der Concierge ist im Moment nicht verfügbar.";
      const visitorMessage = getVisitorErrorMessage(errorMessage);

      console.error(errorMessage);
      setError(visitorMessage);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "Ich konnte diese Nachricht nicht senden. Bitte versuchen Sie es erneut.",
        },
      ]);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendChatMessage(message.trim());
  }

  async function requestRestaurantMenu(restaurantName: string) {
    await sendChatMessage(
      `Zeige mir das Menü von ${restaurantName} mit Preisen.`
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#1f2421]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d8d8ce] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#5b6b5f]">
              Saas-Fee
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#151815] sm:text-4xl">
              {propertyName ? `${propertyName} Concierge` : "KI-Concierge"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5b6b5f]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2f7d59]" />
            {guestContext.propertyId && guestContext.guestAccessToken
              ? "Gästelink aktiv"
              : "Online"}
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-[66vh] flex-col overflow-hidden rounded-lg border border-[#d8d8ce] bg-white shadow-sm">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 sm:max-w-[76%] ${
                      item.role === "user"
                        ? "bg-[#1f5f46] text-white"
                        : "border border-[#d8d8ce] bg-[#fbfbf7] text-[#1f2421]"
                    }`}
                  >
                    <MessageContent
                      content={item.content}
                      isAssistant={item.role === "assistant"}
                      isSending={isSending}
                      onRestaurantClick={requestRestaurantMenu}
                    />
                    {item.meta ? (
                      <p className="mt-2 border-t border-current/20 pt-2 text-xs opacity-75">
                        {item.meta}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-[#d8d8ce] bg-[#fbfbf7] px-4 py-3 text-sm text-[#5b6b5f]">
                    Ich denke nach...
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-[#d8d8ce] bg-[#fbfbf7] p-3 sm:p-4"
            >
              {error ? (
                <p className="mb-3 rounded-md border border-[#d56f5b] bg-[#fff5f2] px-3 py-2 text-sm text-[#8c2f20]">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  className="min-h-12 flex-1 resize-none rounded-md border border-[#c8c8bc] bg-white px-3 py-3 text-base text-[#1f2421] outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  placeholder="Ihre Nachricht..."
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 shrink-0 rounded-md bg-[#1f5f46] px-5 text-sm font-semibold text-white transition hover:bg-[#184936] disabled:cursor-not-allowed disabled:bg-[#a9b5ad]"
                >
                  {isSending ? "Senden..." : "Senden"}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm lg:self-start">
            <h2 className="text-base font-semibold text-[#151815]">
              Gästedaten
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#4f5b52]">Name</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#4f5b52]">
                  E-Mail
                </span>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  autoComplete="email"
                  type="email"
                />
              </label>
            </div>
          </aside>
        </section>

        <footer className="border-t border-[#d8d8ce] py-4 text-sm text-[#5b6b5f]">
          <a
            className="font-medium text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d]"
            href="/privacy"
          >
            Datenschutzerklärung
          </a>
        </footer>
      </div>
    </main>
  );
}
