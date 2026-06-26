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
  reservationRequested?: boolean;
  reservationStatus?: string | null;
  reservationDraft?: {
    restaurantName?: string | null;
    reservationDate?: string | null;
    reservationTime?: string | null;
    partySize?: number | null;
    specialRequests?: string | null;
  } | null;
  error?: string;
};

type ReservationResponse = {
  success?: boolean;
  reservationId?: string | null;
  status?: string;
  message?: string;
  error?: string;
};

type GuestContextResponse = {
  propertyId?: string | null;
  propertySlug?: string | null;
  propertyName?: string | null;
  propertyType?: string | null;
  localAccessGranted?: boolean;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guestyReservationId?: string | null;
  error?: string;
};

type ChatMode = "public" | "apartment" | "hotel" | "property";

type ChatClientProps = {
  mode: ChatMode;
  propertySlug?: string;
};

type UiLanguage = "de" | "en" | "ru" | "fr" | "it";

const UI_TEXT: Record<
  UiLanguage,
  {
    titleFallback: string;
    welcome: (propertyName?: string | null) => string;
    temporaryUnavailable: string;
    unexpectedResponse: string;
    unavailable: string;
    fallbackReply: string;
    sendFailed: string;
    identityRequired: string;
    identityIntro: string;
    optionalEmail: string;
    menuPrompt: (restaurantName: string) => string;
    thinking: string;
    placeholder: string;
    send: string;
    sending: string;
    guestData: string;
    name: string;
    email: string;
    phone: string;
    stay: string;
    checkIn: string;
    checkOut: string;
    guestLinkActive: string;
    online: string;
    privacy: string;
    conversation: string;
    caseLabel: string;
    created: string;
    priority: string;
    quickActions: string;
    restaurantShortcuts: string;
    ask: string;
    showMenu: string;
    reserve: string;
    reservationTitle: string;
    restaurant: string;
    date: string;
    time: string;
    partySize: string;
    specialRequests: string;
    cancel: string;
    sendReservation: string;
    reservationSentFallback: string;
    language: string;
  }
> = {
  de: {
    titleFallback: "Wil Concierge",
    welcome: (propertyName) =>
      propertyName
        ? `Willkommen in ${propertyName}. Ich bin Wil, Ihr KI-Concierge für Saas-Fee. Fragen Sie mich gerne zur Unterkunft, zu Restaurants, Aktivitäten, Bergbahnen, Wetter oder allem, was Sie während Ihres Aufenthalts brauchen.`
        : "Guten Tag, ich bin Wil, Ihr KI-Concierge für Saas-Fee. Fragen Sie mich gerne zu Restaurants, Aktivitäten, Bergbahnen, Wetter oder allem, was Sie während Ihres Aufenthalts brauchen.",
    temporaryUnavailable:
      "Wil ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",
    unexpectedResponse:
      "Wil hat eine unerwartete Antwort zurückgegeben. Bitte versuchen Sie es erneut.",
    unavailable: "Wil ist im Moment nicht verfügbar.",
    fallbackReply:
      "Danke. Ich habe Ihre Nachricht aufgenommen und das Team wird sie in Kürze prüfen.",
    sendFailed:
      "Ich konnte diese Nachricht nicht senden. Bitte versuchen Sie es erneut.",
    identityRequired:
      "Bitte geben Sie zuerst Ihren Namen und Ihre Telefon-/WhatsApp-Nummer ein.",
    identityIntro:
      "Bitte identifizieren Sie sich einmalig mit Name und Telefon. So kann Wil Sie bei Anfragen und Restaurantreservierungen korrekt zuordnen.",
    optionalEmail: "Optional",
    menuPrompt: (restaurantName) =>
      `Zeige mir das Menü von ${restaurantName} mit Preisen.`,
    thinking: "Ich denke nach...",
    placeholder: "Ihre Nachricht...",
    send: "Senden",
    sending: "Senden...",
    guestData: "Gästedaten",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon / WhatsApp",
    stay: "Aufenthalt",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guestLinkActive: "Gästelink aktiv",
    online: "Online",
    privacy: "Datenschutzerklärung",
    conversation: "Konversation",
    caseLabel: "Vorgang",
    created: "erstellt",
    priority: "Priorität",
    quickActions: "Schnell fragen",
    restaurantShortcuts: "Restaurants",
    ask: "Frag Wil",
    showMenu: "Menü",
    reserve: "Reservieren",
    reservationTitle: "Tischreservierung",
    restaurant: "Restaurant",
    date: "Datum",
    time: "Uhrzeit",
    partySize: "Personen",
    specialRequests: "Besondere Wünsche",
    cancel: "Abbrechen",
    sendReservation: "Anfrage senden",
    reservationSentFallback:
      "Die Reservierungsanfrage wurde gespeichert. Die Reservierung ist erst nach Bestätigung des Restaurants verbindlich.",
    language: "Sprache",
  },
  en: {
    titleFallback: "Wil Concierge",
    welcome: (propertyName) =>
      propertyName
        ? `Welcome to ${propertyName}. I am Wil, your AI concierge for Saas-Fee. Ask me about the accommodation, restaurants, activities, mountain railways, weather, or anything you need during your stay.`
        : "Hello, I am Wil, your AI concierge for Saas-Fee. Ask me about restaurants, activities, mountain railways, weather, or anything you need during your stay.",
    temporaryUnavailable:
      "Wil is temporarily unavailable. Please try again later.",
    unexpectedResponse:
      "Wil returned an unexpected response. Please try again.",
    unavailable: "Wil is not available right now.",
    fallbackReply:
      "Thank you. I have received your message and the team will review it shortly.",
    sendFailed: "I could not send this message. Please try again.",
    identityRequired:
      "Please enter your name and phone/WhatsApp number first.",
    identityIntro:
      "Please identify yourself once with your name and phone. This lets Wil assign requests and restaurant reservations correctly.",
    optionalEmail: "Optional",
    menuPrompt: (restaurantName) =>
      `Show me the menu of ${restaurantName} with prices.`,
    thinking: "Thinking...",
    placeholder: "Your message...",
    send: "Send",
    sending: "Sending...",
    guestData: "Guest details",
    name: "Name",
    email: "Email",
    phone: "Phone / WhatsApp",
    stay: "Stay",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guestLinkActive: "Guest link active",
    online: "Online",
    privacy: "Privacy Policy",
    conversation: "Conversation",
    caseLabel: "Case",
    created: "created",
    priority: "Priority",
    quickActions: "Quick questions",
    restaurantShortcuts: "Restaurants",
    ask: "Ask Wil",
    showMenu: "Menu",
    reserve: "Reserve",
    reservationTitle: "Table reservation",
    restaurant: "Restaurant",
    date: "Date",
    time: "Time",
    partySize: "People",
    specialRequests: "Special requests",
    cancel: "Cancel",
    sendReservation: "Send request",
    reservationSentFallback:
      "The reservation request has been saved. The reservation is only binding after the restaurant confirms it.",
    language: "Language",
  },
  ru: {
    titleFallback: "Wil Concierge",
    welcome: (propertyName) =>
      propertyName
        ? `Добро пожаловать в ${propertyName}. Я Wil, ваш AI-консьерж по Saas-Fee. Спрашивайте про жильё, рестораны, активности, горные дороги, погоду и всё, что нужно во время проживания.`
        : "Здравствуйте, я Wil, ваш AI-консьерж по Saas-Fee. Спрашивайте про рестораны, активности, горные дороги, погоду и всё, что нужно во время проживания.",
    temporaryUnavailable:
      "Wil временно недоступен. Пожалуйста, попробуйте позже.",
    unexpectedResponse:
      "Wil вернул неожиданный ответ. Пожалуйста, попробуйте ещё раз.",
    unavailable: "Wil сейчас недоступен.",
    fallbackReply:
      "Спасибо. Я получил ваше сообщение, команда скоро его проверит.",
    sendFailed: "Не удалось отправить сообщение. Пожалуйста, попробуйте ещё раз.",
    identityRequired:
      "Сначала введите имя и номер телефона / WhatsApp.",
    identityIntro:
      "Пожалуйста, один раз укажите имя и телефон. Так Wil сможет правильно привязать запросы и бронирования ресторанов к вам.",
    optionalEmail: "Необязательно",
    menuPrompt: (restaurantName) =>
      `Покажи меню ресторана ${restaurantName} с ценами.`,
    thinking: "Думаю...",
    placeholder: "Ваше сообщение...",
    send: "Отправить",
    sending: "Отправка...",
    guestData: "Данные гостя",
    name: "Имя",
    email: "E-mail",
    phone: "Телефон / WhatsApp",
    stay: "Проживание",
    checkIn: "Заезд",
    checkOut: "Выезд",
    guestLinkActive: "Гостевая ссылка активна",
    online: "Онлайн",
    privacy: "Политика конфиденциальности",
    conversation: "Диалог",
    caseLabel: "Заявка",
    created: "создана",
    priority: "Приоритет",
    quickActions: "Быстрые вопросы",
    restaurantShortcuts: "Рестораны",
    ask: "Спросить Wil",
    showMenu: "Меню",
    reserve: "Забронировать",
    reservationTitle: "Бронирование столика",
    restaurant: "Ресторан",
    date: "Дата",
    time: "Время",
    partySize: "Гостей",
    specialRequests: "Особые пожелания",
    cancel: "Отмена",
    sendReservation: "Отправить запрос",
    reservationSentFallback:
      "Запрос на бронирование сохранён. Бронь действительна только после подтверждения ресторана.",
    language: "Язык",
  },
  fr: {
    titleFallback: "Wil Concierge",
    welcome: (propertyName) =>
      propertyName
        ? `Bienvenue à ${propertyName}. Je suis Wil, votre concierge IA pour Saas-Fee. Posez-moi vos questions sur le logement, les restaurants, les activités, les remontées mécaniques, la météo ou tout ce dont vous avez besoin pendant votre séjour.`
        : "Bonjour, je suis Wil, votre concierge IA pour Saas-Fee. Posez-moi vos questions sur les restaurants, les activités, les remontées mécaniques, la météo ou tout ce dont vous avez besoin pendant votre séjour.",
    temporaryUnavailable:
      "Wil est temporairement indisponible. Veuillez réessayer plus tard.",
    unexpectedResponse:
      "Wil a renvoyé une réponse inattendue. Veuillez réessayer.",
    unavailable: "Wil n'est pas disponible pour le moment.",
    fallbackReply:
      "Merci. J'ai bien reçu votre message et l'équipe va l'examiner sous peu.",
    sendFailed: "Je n'ai pas pu envoyer ce message. Veuillez réessayer.",
    identityRequired:
      "Veuillez d'abord saisir votre nom et votre numéro de téléphone / WhatsApp.",
    identityIntro:
      "Veuillez vous identifier une seule fois avec votre nom et votre téléphone. Wil pourra ainsi associer correctement les demandes et réservations.",
    optionalEmail: "Optionnel",
    menuPrompt: (restaurantName) =>
      `Montrez-moi le menu de ${restaurantName} avec les prix.`,
    thinking: "Je réfléchis...",
    placeholder: "Votre message...",
    send: "Envoyer",
    sending: "Envoi...",
    guestData: "Données du client",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone / WhatsApp",
    stay: "Séjour",
    checkIn: "Arrivée",
    checkOut: "Départ",
    guestLinkActive: "Lien client actif",
    online: "En ligne",
    privacy: "Politique de confidentialité",
    conversation: "Conversation",
    caseLabel: "Dossier",
    created: "créé",
    priority: "Priorité",
    quickActions: "Questions rapides",
    restaurantShortcuts: "Restaurants",
    ask: "Demander à Wil",
    showMenu: "Menu",
    reserve: "Réserver",
    reservationTitle: "Réservation de table",
    restaurant: "Restaurant",
    date: "Date",
    time: "Heure",
    partySize: "Personnes",
    specialRequests: "Demandes spéciales",
    cancel: "Annuler",
    sendReservation: "Envoyer la demande",
    reservationSentFallback:
      "La demande de réservation a été enregistrée. La réservation n'est définitive qu'après confirmation du restaurant.",
    language: "Langue",
  },
  it: {
    titleFallback: "Wil Concierge",
    welcome: (propertyName) =>
      propertyName
        ? `Benvenuti a ${propertyName}. Sono Wil, il vostro concierge IA per Saas-Fee. Chiedetemi informazioni sull'alloggio, ristoranti, attività, impianti di risalita, meteo o qualsiasi cosa vi serva durante il soggiorno.`
        : "Buongiorno, sono Wil, il vostro concierge IA per Saas-Fee. Chiedetemi informazioni su ristoranti, attività, impianti di risalita, meteo o qualsiasi cosa vi serva durante il soggiorno.",
    temporaryUnavailable:
      "Wil è temporaneamente non disponibile. Riprova più tardi.",
    unexpectedResponse:
      "Wil ha restituito una risposta inattesa. Riprova.",
    unavailable: "Wil non è disponibile al momento.",
    fallbackReply:
      "Grazie. Ho ricevuto il tuo messaggio e il team lo controllerà a breve.",
    sendFailed: "Non sono riuscito a inviare questo messaggio. Riprova.",
    identityRequired:
      "Inserisci prima il tuo nome e numero di telefono / WhatsApp.",
    identityIntro:
      "Identificati una sola volta con nome e telefono. Così Wil può associare correttamente richieste e prenotazioni.",
    optionalEmail: "Opzionale",
    menuPrompt: (restaurantName) =>
      `Mostrami il menu di ${restaurantName} con i prezzi.`,
    thinking: "Sto pensando...",
    placeholder: "Il tuo messaggio...",
    send: "Invia",
    sending: "Invio...",
    guestData: "Dati ospite",
    name: "Nome",
    email: "E-mail",
    phone: "Telefono / WhatsApp",
    stay: "Soggiorno",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guestLinkActive: "Link ospite attivo",
    online: "Online",
    privacy: "Informativa sulla privacy",
    conversation: "Conversazione",
    caseLabel: "Caso",
    created: "creato",
    priority: "Priorità",
    quickActions: "Domande rapide",
    restaurantShortcuts: "Ristoranti",
    ask: "Chiedi a Wil",
    showMenu: "Menu",
    reserve: "Prenota",
    reservationTitle: "Prenotazione tavolo",
    restaurant: "Ristorante",
    date: "Data",
    time: "Ora",
    partySize: "Persone",
    specialRequests: "Richieste speciali",
    cancel: "Annulla",
    sendReservation: "Invia richiesta",
    reservationSentFallback:
      "La richiesta di prenotazione è stata salvata. La prenotazione è valida solo dopo la conferma del ristorante.",
    language: "Lingua",
  },
};

const LANGUAGE_OPTIONS: Array<{
  code: UiLanguage;
  label: string;
  ariaLabel: string;
}> = [
  { code: "de", label: "DE", ariaLabel: "Deutsch" },
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fr", label: "FR", ariaLabel: "Français" },
  { code: "it", label: "IT", ariaLabel: "Italiano" },
  { code: "ru", label: "RU", ariaLabel: "Русский" },
];

function getBrowserLanguage(): UiLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const language = navigator.language.toLowerCase();

  if (language.startsWith("de")) return "de";
  if (language.startsWith("ru")) return "ru";
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("it")) return "it";

  return "en";
}

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
  {
    name: "Hotel Restaurant Bristol",
    aliases: ["Hotel Restaurant Bristol", "Restaurant Bristol", "Bristol"],
  },
  { name: "Zur Mühle", aliases: ["Zur Mühle", "Zur Muehle", "Mühle", "Muehle"] },
  { name: "Hohsaas", aliases: ["Hohsaas"] },
  { name: "Felskinn", aliases: ["Felskinn"] },
  { name: "Gletschergrotte", aliases: ["Gletschergrotte"] },
  { name: "Alpenblick", aliases: ["Alpenblick"] },
  { name: "Almagelleralp", aliases: ["Almagelleralp"] },
  { name: "Kreuzboden", aliases: ["Kreuzboden"] },
  { name: "Furggstalden", aliases: ["Furggstalden"] },
];

const RESTAURANT_CARDS = [
  {
    name: "Hannig",
    note: "Sonniger Berglunch, erste Empfehlung",
    price: "CHF 35-55",
  },
  {
    name: "Hotel Restaurant Bristol",
    note: "Hotel-Dinner und Fondue Chinoise",
    price: "CHF 45+",
  },
  {
    name: "Zur Mühle",
    note: "Dorfrestaurant mit WhatsApp-Anfrage",
    price: "CHF 40-75",
  },
];

function getQuickActions(language: UiLanguage) {
  const actions: Record<UiLanguage, Array<{ label: string; prompt: string }>> = {
    de: [
      { label: "Anreise", prompt: "Wie komme ich am besten hierher?" },
      { label: "WLAN", prompt: "Wie funktioniert das WLAN?" },
      { label: "Check-in", prompt: "Was muss ich zum Check-in wissen?" },
      { label: "Restaurants", prompt: "Welche Restaurants empfehlen Sie heute?" },
      { label: "Aktivitäten", prompt: "Welche Aktivitäten empfehlen Sie in Saas-Fee?" },
      { label: "Problem melden", prompt: "Ich möchte ein Problem melden." },
    ],
    en: [
      { label: "Arrival", prompt: "What is the best way to get here?" },
      { label: "Wi-Fi", prompt: "How does the Wi-Fi work?" },
      { label: "Check-in", prompt: "What should I know about check-in?" },
      { label: "Restaurants", prompt: "Which restaurants do you recommend today?" },
      { label: "Activities", prompt: "Which activities do you recommend in Saas-Fee?" },
      { label: "Report issue", prompt: "I would like to report a problem." },
    ],
    ru: [
      { label: "Как добраться", prompt: "Как лучше добраться сюда?" },
      { label: "Wi-Fi", prompt: "Как подключиться к Wi-Fi?" },
      { label: "Заезд", prompt: "Что нужно знать про check-in?" },
      { label: "Рестораны", prompt: "Какие рестораны вы сегодня рекомендуете?" },
      { label: "Активности", prompt: "Какие активности посоветуете в Saas-Fee?" },
      { label: "Проблема", prompt: "Я хочу сообщить о проблеме." },
    ],
    fr: [
      { label: "Arrivée", prompt: "Quel est le meilleur moyen d'arriver ici ?" },
      { label: "Wi-Fi", prompt: "Comment fonctionne le Wi-Fi ?" },
      { label: "Check-in", prompt: "Que dois-je savoir pour le check-in ?" },
      { label: "Restaurants", prompt: "Quels restaurants recommandez-vous aujourd'hui ?" },
      { label: "Activités", prompt: "Quelles activités recommandez-vous à Saas-Fee ?" },
      { label: "Signaler", prompt: "Je souhaite signaler un problème." },
    ],
    it: [
      { label: "Arrivo", prompt: "Qual è il modo migliore per arrivare qui?" },
      { label: "Wi-Fi", prompt: "Come funziona il Wi-Fi?" },
      { label: "Check-in", prompt: "Cosa devo sapere per il check-in?" },
      { label: "Ristoranti", prompt: "Quali ristoranti consigliate oggi?" },
      { label: "Attività", prompt: "Quali attività consigliate a Saas-Fee?" },
      { label: "Problema", prompt: "Vorrei segnalare un problema." },
    ],
  };

  return actions[language];
}

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

function getRestaurantAliasMatcher() {
  const aliases = RESTAURANT_ACTIONS.flatMap((restaurant) => restaurant.aliases)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex);

  return new RegExp(
    `(?<![\\p{L}\\p{N}])(${aliases.join("|")})(?![\\p{L}\\p{N}])`,
    "giu"
  );
}

function inferRestaurantNameFromText(value: string) {
  const match = value.match(getRestaurantAliasMatcher());
  const alias = match?.[1] ?? match?.[0];

  return alias ? getRestaurantByAlias(alias)?.name ?? null : null;
}

function inferReservationRestaurant(
  userText: string,
  messages: ChatMessage[]
) {
  const fromUserText = inferRestaurantNameFromText(userText);

  if (fromUserText) {
    return fromUserText;
  }

  for (const item of [...messages].reverse()) {
    const restaurantName = inferRestaurantNameFromText(item.content);

    if (restaurantName) {
      return restaurantName;
    }
  }

  return null;
}

function getVisitorErrorMessage(
  message: string,
  text: (typeof UI_TEXT)[UiLanguage]
) {
  if (
    message.includes("Missing Supabase") ||
    message.includes("Missing OPENAI") ||
    message.includes("env vars")
  ) {
    return text.temporaryUnavailable;
  }

  return message;
}

function hasLocalAccessMode(mode: ChatMode) {
  return mode !== "public";
}

function resizeTextareaToContent(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
}

function getGuestContextFromUrl(mode: ChatMode, propertySlug?: string) {
  if (typeof window === "undefined") {
    return { accessMode: mode, propertySlug };
  }

  const params = new URLSearchParams(window.location.search);
  const propertyId = hasLocalAccessMode(mode)
    ? params.get("propertyId") || undefined
    : undefined;
  const guestAccessToken =
    params.get("access") || params.get("guestAccessToken") || undefined;

  return {
    accessMode: mode,
    propertyId,
    propertySlug: hasLocalAccessMode(mode) ? propertySlug : undefined,
    guestAccessToken,
  };
}

function getWelcomeMessage(language: UiLanguage, propertyName?: string | null) {
  return UI_TEXT[language].welcome(propertyName);
}

type SavedChatState = {
  messages?: ChatMessage[];
  conversationId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type ReservationFormState = {
  isOpen: boolean;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: string;
  specialRequests: string;
};

function getChatStorageKey(
  mode: ChatMode,
  propertySlug: string | undefined,
  guestAccessToken: string | undefined
) {
  const scope = [
    mode,
    propertySlug ?? "public",
    guestAccessToken ? guestAccessToken.slice(0, 16) : "anonymous",
  ].join(":");

  return `saas-fee-ai-concierge:chat:${scope}`;
}

function readSavedChatState(storageKey: string): SavedChatState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as SavedChatState) : null;
  } catch {
    return null;
  }
}

function getInitialMessages(
  language: UiLanguage,
  savedState: SavedChatState | null
) {
  const savedMessages = Array.isArray(savedState?.messages)
    ? savedState.messages.filter(
        (item) =>
          typeof item.id === "string" &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
    : [];

  return savedMessages.length
    ? savedMessages
    : [
        {
          id: "welcome",
          role: "assistant" as const,
          content: getWelcomeMessage(language),
        },
      ];
}

function formatStayDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.hostname === "www.google.com" &&
      url.pathname.startsWith("/maps/")
    );
  } catch {
    return false;
  }
}

function stripMarkdownHeadings(value: string) {
  return value.replace(/^#{1,6}\s+/gm, "");
}

function renderAssistantInline(
  text: string,
  isSending: boolean,
  onRestaurantClick: (restaurantName: string) => void,
  keyPrefix: string
): ReactNode[] {
  const tokenMatcher = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)/giu;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  function pushRestaurantAwareText(segment: string) {
    if (!segment) {
      return;
    }

    const matcher = getRestaurantAliasMatcher();
    let segmentLastIndex = 0;

    for (const match of segment.matchAll(matcher)) {
      const matchIndex = match.index ?? 0;
      const alias = match[1];
      const restaurant = getRestaurantByAlias(alias);

      if (!restaurant) {
        continue;
      }

      if (matchIndex > segmentLastIndex) {
        nodes.push(segment.slice(segmentLastIndex, matchIndex));
      }

      nodes.push(
        <button
          className="inline rounded-sm font-semibold text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d] disabled:cursor-wait disabled:opacity-60"
          disabled={isSending}
          key={`${keyPrefix}-restaurant-${tokenIndex++}`}
          onClick={() => onRestaurantClick(restaurant.name)}
          title={`Menü und Preise anzeigen: ${restaurant.name}`}
          type="button"
        >
          {alias}
        </button>
      );

      segmentLastIndex = matchIndex + alias.length;
    }

    if (segmentLastIndex < segment.length) {
      nodes.push(segment.slice(segmentLastIndex));
    }
  }

  for (const match of text.matchAll(tokenMatcher)) {
    const matchIndex = match.index ?? 0;
    const fullMatch = match[0];
    const linkText = match[2];
    const linkUrl = match[3];
    const boldText = match[5];

    if (matchIndex > lastIndex) {
      pushRestaurantAwareText(text.slice(lastIndex, matchIndex));
    }

    if (linkText && linkUrl) {
      const isMapLink = isGoogleMapsUrl(linkUrl);

      nodes.push(
        <a
          className={
            isMapLink
              ? "my-1 inline-flex items-center rounded-md bg-[#1f5f46] px-3 py-1.5 text-sm font-semibold text-white no-underline transition hover:bg-[#184936]"
              : "font-semibold text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d]"
          }
          href={linkUrl}
          key={`${keyPrefix}-link-${tokenIndex++}`}
          rel="noreferrer"
          target="_blank"
        >
          {linkText}
        </a>
      );
    } else if (boldText) {
      nodes.push(
        <strong
          className="font-semibold text-[#151815]"
          key={`${keyPrefix}-bold-${tokenIndex++}`}
        >
          {boldText}
        </strong>
      );
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    pushRestaurantAwareText(text.slice(lastIndex));
  }

  return nodes;
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

  const nodes = renderAssistantInline(
    stripMarkdownHeadings(content),
    isSending,
    onRestaurantClick,
    "assistant-message"
  );

  return <p className="whitespace-pre-wrap break-words">{nodes}</p>;
}

export default function ChatClient({ mode, propertySlug }: ChatClientProps) {
  const [language, setLanguage] = useState<UiLanguage>(() => getBrowserLanguage());
  const ui = UI_TEXT[language];
  const quickActions = useMemo(() => getQuickActions(language), [language]);
  const [guestContext] = useState<{
    accessMode: ChatMode;
    propertyId?: string;
    propertySlug?: string;
    guestAccessToken?: string;
  }>(() => getGuestContextFromUrl(mode, propertySlug));
  const storageKey = useMemo(
    () =>
      getChatStorageKey(
        mode,
        guestContext.propertySlug,
        guestContext.guestAccessToken
      ),
    [guestContext.guestAccessToken, guestContext.propertySlug, mode]
  );
  const [savedState] = useState<SavedChatState | null>(() =>
    readSavedChatState(storageKey)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getInitialMessages(language, savedState)
  );
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState(
    () => savedState?.customerName ?? ""
  );
  const [customerEmail, setCustomerEmail] = useState(
    () => savedState?.customerEmail ?? ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    () => savedState?.customerPhone ?? ""
  );
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    () => savedState?.conversationId ?? null
  );
  const [reservationForm, setReservationForm] = useState<ReservationFormState>({
    isOpen: false,
    restaurantName: "",
    reservationDate: "",
    reservationTime: "",
    partySize: "2",
    specialRequests: "",
  });
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReservationSending, setIsReservationSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const identityRequiredHintId = "guest-identity-required-hint";
  const hasGuestAccessLink = hasLocalAccessMode(mode)
    ? Boolean(guestContext.guestAccessToken)
    : false;
  const needsGuestIdentity =
    hasGuestAccessLink && (!customerName.trim() || !customerPhone.trim());
  const hasStayInfo = Boolean(checkIn || checkOut);

  const canSend = useMemo(
    () => message.trim().length > 0 && !isSending && !needsGuestIdentity,
    [isSending, message, needsGuestIdentity]
  );
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isSending, messages, reservationForm.isOpen]);

  useEffect(() => {
    resizeTextareaToContent(textareaRef.current);
  }, [message]);

  useEffect(() => {
    setMessages((current) =>
      current.map((item) =>
        item.id === "welcome"
          ? {
              ...item,
              content: getWelcomeMessage(language, propertyName),
            }
          : item
      )
    );
  }, [language, propertyName]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const latestSavedState = readSavedChatState(storageKey);

      if (latestSavedState) {
        setMessages(getInitialMessages(language, latestSavedState));
        setConversationId(latestSavedState.conversationId ?? null);
        setCustomerName(latestSavedState.customerName ?? "");
        setCustomerEmail(latestSavedState.customerEmail ?? "");
        setCustomerPhone(latestSavedState.customerPhone ?? "");
      }

      setIsStorageLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [language, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStorageLoaded) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        messages,
        conversationId,
        customerName,
        customerEmail,
        customerPhone,
      } satisfies SavedChatState)
    );
  }, [
    conversationId,
    customerEmail,
    customerName,
    customerPhone,
    isStorageLoaded,
    messages,
    storageKey,
  ]);

  useEffect(() => {
    if (mode === "public") {
      return;
    }

    const params = new URLSearchParams();

    params.set("accessMode", mode);

    if (guestContext.propertyId) {
      params.set("propertyId", guestContext.propertyId);
    }

    if (guestContext.propertySlug) {
      params.set("propertySlug", guestContext.propertySlug);
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
        const loadedGuestName = data?.guestName?.trim();
        const loadedGuestEmail = data?.guestEmail?.trim();
        const loadedGuestPhone = data?.guestPhone?.trim();

        if (loadedGuestName) {
          setCustomerName((current) => current || loadedGuestName);
        }

        if (loadedGuestEmail) {
          setCustomerEmail((current) => current || loadedGuestEmail);
        }

        if (loadedGuestPhone) {
          setCustomerPhone((current) => current || loadedGuestPhone);
        }

        setCheckIn(data?.checkIn ?? null);
        setCheckOut(data?.checkOut ?? null);

        if (!loadedPropertyName) {
          return;
        }

        setPropertyName(loadedPropertyName);
        setMessages((current) =>
          current.map((item) =>
            item.id === "welcome"
              ? {
                  ...item,
                  content: getWelcomeMessage(language, loadedPropertyName),
                }
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
  }, [guestContext, language, mode]);

  async function sendChatMessage(text: string) {
    if (!text || isSending) {
      return;
    }

    if (needsGuestIdentity) {
      setError(ui.identityRequired);
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
          customerPhone: customerPhone.trim() || undefined,
          conversationId: conversationId ?? undefined,
          context: {
            source: "website-chat",
            browserLanguage: navigator.language,
            uiLanguage: language,
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
          error: ui.unexpectedResponse,
        };
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || ui.unavailable);
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            data.reply || ui.fallbackReply,
          meta: data.incidentCreated
            ? `${ui.caseLabel} ${data.incidentId ?? ui.created}${
                data.priority ? `, ${ui.priority}: ${data.priority}` : ""
              }`
            : data.conversationId
              ? `${ui.conversation} ${data.conversationId}`
              : undefined,
        },
      ]);

      if (
        data.reservationRequested &&
        data.reservationStatus === "missing_fields"
      ) {
        const restaurantName =
          data.reservationDraft?.restaurantName ??
          inferReservationRestaurant(text, messages);

        openReservationForm(restaurantName ?? "", data.reservationDraft);
      }
    } catch (sendError) {
      const errorMessage =
        sendError instanceof Error
          ? sendError.message
          : ui.unavailable;
      const visitorMessage = getVisitorErrorMessage(errorMessage, ui);

      console.error(errorMessage);
      setError(visitorMessage);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: ui.sendFailed,
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
    await sendChatMessage(ui.menuPrompt(restaurantName));
  }

  function openReservationForm(
    restaurantName: string,
    draft?: ChatResponse["reservationDraft"]
  ) {
    setError(null);
    setReservationForm((current) => ({
      ...current,
      isOpen: true,
      restaurantName,
      reservationDate:
        draft?.reservationDate ?? current.reservationDate,
      reservationTime:
        draft?.reservationTime ?? current.reservationTime,
      partySize: draft?.partySize
        ? String(draft.partySize)
        : current.partySize || "2",
      specialRequests:
        draft?.specialRequests ?? current.specialRequests,
    }));
  }

  async function sendReservationRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsReservationSending(true);

    try {
      const response = await fetch("/api/restaurants/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantName: reservationForm.restaurantName,
          reservationDate: reservationForm.reservationDate,
          reservationTime: reservationForm.reservationTime,
          partySize: Number(reservationForm.partySize),
          guestName: customerName.trim(),
          guestContact: customerPhone.trim(),
          specialRequests: reservationForm.specialRequests.trim() || undefined,
          conversationId: conversationId ?? undefined,
          context: guestContext,
        }),
      });
      const data = (await response.json()) as ReservationResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || ui.unavailable);
      }

      setReservationForm((current) => ({
        ...current,
        isOpen: false,
        specialRequests: "",
      }));
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: data.message || ui.reservationSentFallback,
          meta: data.reservationId
            ? `Reservierung ${data.reservationId}${
                data.status ? `, Status: ${data.status}` : ""
              }`
            : undefined,
        },
      ]);
    } catch (reservationError) {
      const message =
        reservationError instanceof Error
          ? reservationError.message
          : ui.unavailable;

      setError(getVisitorErrorMessage(message, ui));
    } finally {
      setIsReservationSending(false);
    }
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
              {propertyName ? `${propertyName} Wil Concierge` : ui.titleFallback}
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2 text-sm text-[#5b6b5f]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2f7d59]" />
              {hasLocalAccessMode(mode) && guestContext.guestAccessToken
                ? ui.guestLinkActive
                : ui.online}
            </div>
            <div
              aria-label={ui.language}
              className="flex rounded-md border border-[#c8c8bc] bg-white p-1"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  aria-label={option.ariaLabel}
                  aria-pressed={option.code === language}
                  className={`h-8 min-w-9 rounded px-2 text-xs font-semibold transition ${
                    option.code === language
                      ? "bg-[#1f5f46] text-white"
                      : "text-[#4f5b52] hover:bg-[#eef3ed]"
                  }`}
                  key={option.code}
                  onClick={() => setLanguage(option.code)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section
          className={`grid flex-1 gap-5 py-5 ${
            hasStayInfo ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""
          }`}
        >
          <div className="flex min-h-[66vh] flex-col overflow-hidden rounded-lg border border-[#d8d8ce] bg-white shadow-sm">
            {needsGuestIdentity ? (
              <div className="border-b border-[#ecece3] bg-[#f7faf6] px-4 py-4 sm:px-6">
                <div className="grid gap-3 lg:grid-cols-[1fr_0.85fr_0.85fr_0.85fr] lg:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6b5f]">
                      {ui.guestData}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#5b6b5f]">
                      {ui.identityIntro}
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium text-[#4f5b52]">
                      {ui.name}
                    </span>
                    <input
                      autoComplete="name"
                      className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] bg-white px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                      onChange={(event) => setCustomerName(event.target.value)}
                      value={customerName}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-[#4f5b52]">
                      {ui.email}{" "}
                      <span className="font-normal text-[#7a857d]">
                        ({ui.optionalEmail})
                      </span>
                    </span>
                    <input
                      autoComplete="email"
                      className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] bg-white px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      type="email"
                      value={customerEmail}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-[#4f5b52]">
                      {ui.phone}
                    </span>
                    <input
                      autoComplete="tel"
                      className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] bg-white px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      type="tel"
                      value={customerPhone}
                    />
                  </label>
                </div>
              </div>
            ) : null}
            <div className="border-b border-[#ecece3] bg-[#fbfbf7] px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6b5f]">
                  {ui.quickActions}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      aria-describedby={
                        needsGuestIdentity ? identityRequiredHintId : undefined
                      }
                      className="rounded-md border border-[#c8c8bc] bg-white px-3 py-2 text-sm font-medium text-[#1f2421] transition hover:border-[#2f7d59] hover:bg-[#eef3ed] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSending || needsGuestIdentity}
                      key={action.label}
                      onClick={() => sendChatMessage(action.prompt)}
                      title={needsGuestIdentity ? ui.identityRequired : undefined}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6b5f]">
                  {ui.restaurantShortcuts}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {RESTAURANT_CARDS.map((restaurant) => (
                    <div
                      className="rounded-md border border-[#d8d8ce] bg-white p-3"
                      key={restaurant.name}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#151815]">
                            {restaurant.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#5b6b5f]">
                            {restaurant.note}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#eef3ed] px-2 py-1 text-xs font-semibold text-[#1f5f46]">
                          {restaurant.price}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          aria-describedby={
                            needsGuestIdentity
                              ? identityRequiredHintId
                              : undefined
                          }
                          className="h-8 flex-1 rounded-md border border-[#c8c8bc] text-xs font-semibold text-[#1f5f46] transition hover:border-[#1f5f46] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSending || needsGuestIdentity}
                          onClick={() =>
                            sendChatMessage(
                              `${ui.ask}: ${restaurant.name}`
                            )
                          }
                          title={
                            needsGuestIdentity ? ui.identityRequired : undefined
                          }
                          type="button"
                        >
                          {ui.ask}
                        </button>
                        <button
                          aria-describedby={
                            needsGuestIdentity
                              ? identityRequiredHintId
                              : undefined
                          }
                          className="h-8 flex-1 rounded-md border border-[#c8c8bc] text-xs font-semibold text-[#1f5f46] transition hover:border-[#1f5f46] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSending || needsGuestIdentity}
                          onClick={() => requestRestaurantMenu(restaurant.name)}
                          title={
                            needsGuestIdentity ? ui.identityRequired : undefined
                          }
                          type="button"
                        >
                          {ui.showMenu}
                        </button>
                        <button
                          aria-describedby={
                            needsGuestIdentity
                              ? identityRequiredHintId
                              : undefined
                          }
                          className="h-8 flex-1 rounded-md bg-[#1f5f46] text-xs font-semibold text-white transition hover:bg-[#184936] disabled:cursor-not-allowed disabled:bg-[#a9b5ad]"
                          disabled={isSending || needsGuestIdentity}
                          onClick={() => openReservationForm(restaurant.name)}
                          title={
                            needsGuestIdentity ? ui.identityRequired : undefined
                          }
                          type="button"
                        >
                          {ui.reserve}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
              {reservationForm.isOpen ? (
                <div className="flex justify-start">
                  <form
                    className="w-full max-w-4xl rounded-lg border border-[#d8d8ce] bg-white px-4 py-4 shadow-sm"
                    onSubmit={sendReservationRequest}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6b5f]">
                          {ui.reservationTitle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#151815]">
                          {reservationForm.restaurantName || "-"}
                        </p>
                      </div>
                      <button
                        className="self-start text-sm font-medium text-[#5b6b5f] underline-offset-4 hover:underline sm:self-auto"
                        onClick={() =>
                          setReservationForm((current) => ({
                            ...current,
                            isOpen: false,
                          }))
                        }
                        type="button"
                      >
                        {ui.cancel}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.restaurant}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          onChange={(event) =>
                            setReservationForm((current) => ({
                              ...current,
                              restaurantName: event.target.value,
                            }))
                          }
                          required
                          type="text"
                          value={reservationForm.restaurantName}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.date}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(event) =>
                            setReservationForm((current) => ({
                              ...current,
                              reservationDate: event.target.value,
                            }))
                          }
                          required
                          type="date"
                          value={reservationForm.reservationDate}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.time}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          onChange={(event) =>
                            setReservationForm((current) => ({
                              ...current,
                              reservationTime: event.target.value,
                            }))
                          }
                          required
                          type="time"
                          value={reservationForm.reservationTime}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.partySize}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          max={30}
                          min={1}
                          onChange={(event) =>
                            setReservationForm((current) => ({
                              ...current,
                              partySize: event.target.value,
                            }))
                          }
                          required
                          type="number"
                          value={reservationForm.partySize}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.name}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                          required
                          type="text"
                          value={customerName}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f5b52]">
                          {ui.phone}
                        </span>
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                          onChange={(event) =>
                            setCustomerPhone(event.target.value)
                          }
                          required
                          type="tel"
                          value={customerPhone}
                        />
                      </label>
                    </div>
                    <label className="mt-3 block">
                      <span className="text-sm font-medium text-[#4f5b52]">
                        {ui.specialRequests}{" "}
                        <span className="font-normal text-[#7a857d]">
                          ({ui.optionalEmail})
                        </span>
                      </span>
                      <textarea
                        className="mt-1 min-h-20 w-full resize-none rounded-md border border-[#c8c8bc] px-3 py-2 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                        onChange={(event) =>
                          setReservationForm((current) => ({
                            ...current,
                            specialRequests: event.target.value,
                          }))
                        }
                        value={reservationForm.specialRequests}
                      />
                    </label>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="h-11 rounded-md bg-[#1f5f46] px-4 text-sm font-semibold text-white transition hover:bg-[#184936] disabled:cursor-not-allowed disabled:bg-[#a9b5ad]"
                        disabled={isReservationSending}
                        type="submit"
                      >
                        {isReservationSending ? ui.sending : ui.sendReservation}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-[#d8d8ce] bg-[#fbfbf7] px-4 py-3 text-sm text-[#5b6b5f]">
                    {ui.thinking}
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
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
              {needsGuestIdentity ? (
                <p
                  className="mb-3 rounded-md border border-[#d8d8ce] bg-white px-3 py-2 text-sm text-[#5b6b5f]"
                  id={identityRequiredHintId}
                >
                  {ui.identityRequired}
                </p>
              ) : null}
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onInput={(event) =>
                    resizeTextareaToContent(event.currentTarget)
                  }
                  rows={2}
                  className="min-h-12 max-h-40 flex-1 resize-none overflow-y-auto rounded-md border border-[#c8c8bc] bg-white px-3 py-3 text-base text-[#1f2421] outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  placeholder={ui.placeholder}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 shrink-0 rounded-md bg-[#1f5f46] px-5 text-sm font-semibold text-white transition hover:bg-[#184936] disabled:cursor-not-allowed disabled:bg-[#a9b5ad]"
                >
                  {isSending ? ui.sending : ui.send}
                </button>
              </div>
            </form>
          </div>

          {hasStayInfo ? (
            <aside className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm lg:self-start">
              <h2 className="text-base font-semibold text-[#151815]">
                {ui.stay}
              </h2>
              <div className="mt-4 rounded-md border border-[#d8d8ce] bg-[#fbfbf7] px-3 py-3 text-sm text-[#4f5b52]">
                {checkIn ? (
                  <p>
                    {ui.checkIn}: {formatStayDate(checkIn)}
                  </p>
                ) : null}
                {checkOut ? (
                  <p className="mt-1">
                    {ui.checkOut}: {formatStayDate(checkOut)}
                  </p>
                ) : null}
              </div>
            </aside>
          ) : null}
        </section>

        <footer className="border-t border-[#d8d8ce] py-4 text-sm text-[#5b6b5f]">
          <a
            className="font-medium text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d]"
            href="/privacy"
          >
            {ui.privacy}
          </a>
        </footer>
      </div>
    </main>
  );
}
