import type { Metadata } from "next";

export type LandingLocale = "de" | "en" | "fr" | "it";

type LandingCopy = {
  lang: string;
  label: string;
  path: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    locale: string;
  };
  nav: {
    product: string;
    modules: string;
    contact: string;
    chat: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    audience: string;
    guestCta: string;
    ownerCta: string;
    imageAlt: string;
  };
  metrics: {
    eyebrow: string;
    items: Array<{
      value: string;
      label: string;
    }>;
  };
  product: {
    eyebrow: string;
    title: string;
    features: Array<{
      title: string;
      text: string;
    }>;
  };
  useCases: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  architecture: {
    eyebrow: string;
    title: string;
    text: string;
    modules: string[];
    techLabel: string;
    techStack: string[];
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
  };
  demo: {
    eyebrow: string;
    title: string;
    cta: string;
  };
  form: {
    website: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    messagePlaceholder: string;
    consent: string;
    submit: string;
    submitting: string;
    success: string;
    fallbackError: string;
  };
  structuredDataPlace: string;
};

export const landingCopies: Record<LandingLocale, LandingCopy> = {
  de: {
    lang: "de-CH",
    label: "DE",
    path: "/",
    metadata: {
      title: "Saas-Fee AI Concierge | Öffentlicher KI-Concierge für Gäste",
      description:
        "Öffentlicher KI-Concierge für Gäste und Besucher in Saas-Fee: Restaurants, Aktivitäten, Bergbahnen, Wetter, Events, Ortsinfos und Aufenthaltsservice rund um die Uhr.",
      keywords: [
        "Saas-Fee AI Concierge",
        "Saas-Fee Concierge",
        "AI Concierge Saas-Fee",
        "KI Concierge Saas-Fee",
        "Saas-Fee Chatbot",
        "Saas-Fee Restaurants",
        "Saas-Fee Aktivitäten",
        "Saas-Fee Bergbahnen",
        "Saas-Fee Wetter",
      ],
      locale: "de_CH",
    },
    nav: {
      product: "Projekt",
      modules: "Module",
      contact: "Kontakt",
      chat: "Chat öffnen",
    },
    hero: {
      eyebrow: "Öffentlicher KI-Concierge für Saas-Fee",
      title:
        "Der digitale Concierge für Gäste, Besucher und Aufenthalte in Saas-Fee.",
      description:
        "Fragen Sie direkt nach Restaurants, Menüs, Aktivitäten, Bergbahnen, Live-Status, Wetter, Events, Anreise, Sicherheit und lokalen Services. Für Partnerunterkünfte können zusätzlich geschützte Gästeinformationen eingebunden werden.",
      audience:
        "Für Gäste sofort nutzbar. Für Eigentümer, Ferienwohnungen und Hotels als Gästeservice integrierbar.",
      guestCta: "Als Gast ausprobieren",
      ownerCta: "Für mein Objekt verbinden",
      imageAlt: "Saas-Fee Bergpanorama",
    },
    metrics: {
      eyebrow: "Bereits verfügbar",
      items: [
        { value: "5", label: "Sprachen im Interface" },
        { value: "24/7", label: "Antworten für Gäste" },
        { value: "2", label: "Wissensbereiche" },
        { value: "WhatsApp", label: "Meldungen und Reservationen" },
      ],
    },
    product: {
      eyebrow: "Produkt",
      title:
        "Ein Concierge für öffentliche Saas-Fee-Fragen und optionale Gästeinformationen.",
      features: [
        {
          title: "Antworten rund um die Uhr",
          text: "Gäste erhalten sofort Hilfe zu Restaurants, Bergbahnen, Wetter, Events, Anreise, Sicherheit, Einkauf, Apotheke und Aktivitäten.",
        },
        {
          title: "Öffentlicher Saas-Fee-Wissensbereich",
          text: "Der Chat trennt allgemeine Ortsinformationen von geschützten Informationen einzelner Unterkünfte und Hotels.",
        },
        {
          title: "Vorfälle und WhatsApp",
          text: "Der Concierge erkennt dringende Anliegen, erstellt einen Vorgang und kann Eigentümer oder Betriebsteam per WhatsApp informieren.",
        },
      ],
    },
    useCases: {
      eyebrow: "Anwendungsfälle",
      title:
        "Der Concierge beantwortet typische Gäste- und Besucherfragen direkt im Chat.",
      items: [
        "Ein Besucher fragt, welche Restaurants heute passen und möchte Menüs mit Preisen sehen.",
        "Eine Familie sucht Aktivitäten, Spielplätze, Wanderwege oder Schlechtwetterideen.",
        "Ein Gast fragt nach Bergbahnen, offenen Anlagen, Wetter, Bus, Apotheke oder Einkauf.",
        "Partnerunterkünfte können zusätzlich Check-in, WLAN, Hausregeln und Vorfälle abdecken.",
      ],
    },
    architecture: {
      eyebrow: "Betrieb",
      title: "Zuverlässig, sicher und bereit für den Einsatz mit Gästen.",
      text: "Der Concierge ist für den täglichen Gästekontakt ausgelegt: öffentliche Ortsinformationen bleiben von geschützten Objektinformationen getrennt, Anfragen werden nachvollziehbar protokolliert und wichtige Anliegen können direkt weitergeleitet werden.",
      modules: [
        "Öffentlicher Saas-Fee Chat",
        "Geschützte Informationen pro Objekt",
        "Sichere Gästelinks",
        "Dialogprotokolle und Statistiken",
        "Restaurantmenüs und Reservationen",
        "WhatsApp-Hinweise bei wichtigen Anliegen",
      ],
      techLabel: "Technische Basis",
      techStack: ["Next.js", "OpenAI", "Supabase", "Twilio", "Vercel"],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Möchten Sie den Saas-Fee AI Concierge für Gäste nutzen?",
      text: "Senden Sie eine kurze Nachricht. Die Anfrage wird direkt in HubSpot erfasst, damit sie sauber nachverfolgt werden kann.",
    },
    demo: {
      eyebrow: "Demo",
      title:
        "Testen Sie, wie der KI-Concierge im echten Gästeinterface antwortet.",
      cta: "Chat starten",
    },
    form: {
      website: "Website",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      company: "Unternehmen oder Objekt",
      message: "Nachricht",
      messagePlaceholder:
        "Worum geht es bei Ihrer Unterkunft oder Ihrem Gästeservice?",
      consent:
        "Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage in HubSpot gespeichert und verwendet werden.",
      submit: "Anfrage senden",
      submitting: "Wird gesendet...",
      success: "Vielen Dank. Ihre Nachricht wurde an HubSpot übermittelt.",
      fallbackError: "Die Nachricht konnte nicht gesendet werden.",
    },
    structuredDataPlace: "Saas-Fee, Schweiz",
  },
  en: {
    lang: "en",
    label: "EN",
    path: "/en",
    metadata: {
      title: "Saas-Fee AI Concierge | Public AI Concierge for Guests",
      description:
        "Public AI concierge for guests and visitors in Saas-Fee: restaurants, activities, mountain railways, weather, events, local services, and stay support around the clock.",
      keywords: [
        "Saas-Fee AI Concierge",
        "Saas-Fee concierge",
        "AI concierge Saas-Fee",
        "Saas-Fee chatbot",
        "Saas-Fee restaurants",
        "Saas-Fee activities",
        "Saas-Fee mountain railways",
        "Saas-Fee weather",
      ],
      locale: "en",
    },
    nav: {
      product: "Project",
      modules: "Modules",
      contact: "Contact",
      chat: "Open chat",
    },
    hero: {
      eyebrow: "Public AI concierge for Saas-Fee",
      title:
        "The digital concierge for guests, visitors, and stays in Saas-Fee.",
      description:
        "Ask directly about restaurants, menus, activities, mountain railways, live status, weather, events, arrival, safety, and local services. Partner properties can add protected guest information.",
      audience:
        "Ready for guests now. Available for apartment owners and hotels as an integrated guest service.",
      guestCta: "Try as a guest",
      ownerCta: "Connect my property",
      imageAlt: "Saas-Fee mountain panorama",
    },
    metrics: {
      eyebrow: "Already available",
      items: [
        { value: "5", label: "Interface languages" },
        { value: "24/7", label: "Answers for guests" },
        { value: "2", label: "Knowledge areas" },
        { value: "WhatsApp", label: "Alerts and reservations" },
      ],
    },
    product: {
      eyebrow: "Product",
      title: "One concierge for public Saas-Fee questions and optional guest information.",
      features: [
        {
          title: "Answers around the clock",
          text: "Guests get immediate help with restaurants, mountain railways, weather, events, arrival, safety, groceries, pharmacy, and activities.",
        },
        {
          title: "Public Saas-Fee knowledge",
          text: "The chat separates general destination information from protected property and hotel information.",
        },
        {
          title: "Incidents and WhatsApp",
          text: "The concierge detects urgent requests, creates a case, and can notify the owner or operations team via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Use cases",
      title: "The concierge answers typical guest and visitor questions directly in chat.",
      items: [
        "A visitor asks which restaurants fit today and wants menus with prices.",
        "A family looks for activities, playgrounds, hiking routes, or rainy-day ideas.",
        "A guest asks about cable cars, open facilities, weather, buses, pharmacy, or groceries.",
        "Partner properties can also cover check-in, Wi-Fi, house rules, and incidents.",
      ],
    },
    architecture: {
      eyebrow: "Operations",
      title: "Reliable, secure, and ready to use with guests.",
      text: "The concierge is built for everyday guest communication: public destination information stays separate from protected property information, requests are logged clearly, and important issues can be forwarded directly.",
      modules: [
        "Public Saas-Fee chat",
        "Protected information per property",
        "Secure guest links",
        "Conversation logs and statistics",
        "Restaurant menus and reservations",
        "WhatsApp alerts for important issues",
      ],
      techLabel: "Technical foundation",
      techStack: ["Next.js", "OpenAI", "Supabase", "Twilio", "Vercel"],
    },
    contact: {
      eyebrow: "Contact",
      title: "Would you like to use the Saas-Fee AI Concierge for guests?",
      text: "Send a short message. The request is recorded directly in HubSpot for a clear follow-up.",
    },
    demo: {
      eyebrow: "Demo",
      title: "Test how the AI concierge responds in the real guest interface.",
      cta: "Start chat",
    },
    form: {
      website: "Website",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      company: "Company or property",
      message: "Message",
      messagePlaceholder:
        "What would you like to improve in your property or guest service?",
      consent:
        "I agree that my details may be stored and used in HubSpot to process this request.",
      submit: "Send request",
      submitting: "Sending...",
      success: "Thank you. Your message has been submitted to HubSpot.",
      fallbackError: "The message could not be sent.",
    },
    structuredDataPlace: "Saas-Fee, Switzerland",
  },
  fr: {
    lang: "fr",
    label: "FR",
    path: "/fr",
    metadata: {
      title: "Saas-Fee AI Concierge | Concierge IA public pour les visiteurs",
      description:
        "Concierge IA public pour les invités et visiteurs de Saas-Fee : restaurants, activités, remontées mécaniques, météo, événements, services locaux et aide au séjour 24 h/24.",
      keywords: [
        "Saas-Fee AI Concierge",
        "concierge Saas-Fee",
        "concierge IA Saas-Fee",
        "chatbot Saas-Fee",
        "restaurants Saas-Fee",
        "activités Saas-Fee",
        "remontées mécaniques Saas-Fee",
        "météo Saas-Fee",
      ],
      locale: "fr",
    },
    nav: {
      product: "Projet",
      modules: "Modules",
      contact: "Contact",
      chat: "Ouvrir le chat",
    },
    hero: {
      eyebrow: "Concierge IA public pour Saas-Fee",
      title:
        "Le concierge numérique pour les invités, visiteurs et séjours à Saas-Fee.",
      description:
        "Posez vos questions sur les restaurants, menus, activités, remontées mécaniques, statuts en direct, météo, événements, arrivée, sécurité et services locaux. Les hébergements partenaires peuvent ajouter des informations protégées.",
      audience:
        "Disponible dès maintenant pour les visiteurs. Intégrable pour propriétaires, appartements et hôtels comme service invités.",
      guestCta: "Essayer comme invité",
      ownerCta: "Connecter mon hébergement",
      imageAlt: "Panorama de montagne à Saas-Fee",
    },
    metrics: {
      eyebrow: "Déjà disponible",
      items: [
        { value: "5", label: "Langues d'interface" },
        { value: "24/7", label: "Réponses aux invités" },
        { value: "2", label: "Sources de connaissance" },
        { value: "WhatsApp", label: "Alertes et réservations" },
      ],
    },
    product: {
      eyebrow: "Produit",
      title:
        "Un concierge pour les questions publiques sur Saas-Fee et les informations invités optionnelles.",
      features: [
        {
          title: "Réponses 24 h/24",
          text: "Les invités obtiennent une aide immédiate sur les restaurants, remontées mécaniques, météo, événements, arrivée, sécurité, courses, pharmacie et activités.",
        },
        {
          title: "Connaissance publique de Saas-Fee",
          text: "Le chat sépare les informations générales de la destination des informations protégées propres aux hébergements et hôtels.",
        },
        {
          title: "Incidents et WhatsApp",
          text: "Le concierge détecte les demandes urgentes, crée un dossier et peut informer le propriétaire ou l'équipe d'exploitation via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Cas d'utilisation",
      title:
        "Le concierge répond directement aux questions typiques des invités et visiteurs.",
      items: [
        "Un visiteur demande quels restaurants conviennent aujourd'hui et veut voir les menus avec prix.",
        "Une famille cherche des activités, aires de jeux, itinéraires de randonnée ou idées par mauvais temps.",
        "Un invité demande les remontées ouvertes, la météo, les bus, la pharmacie ou les magasins.",
        "Les hébergements partenaires peuvent aussi couvrir check-in, Wi-Fi, règles de maison et incidents.",
      ],
    },
    architecture: {
      eyebrow: "Exploitation",
      title: "Fiable, sécurisé et prêt à être utilisé avec les invités.",
      text: "Le concierge est conçu pour la communication quotidienne avec les invités : les informations publiques de la destination restent séparées des informations protégées des hébergements, les demandes sont consignées clairement et les sujets importants peuvent être transmis directement.",
      modules: [
        "Chat public Saas-Fee",
        "Informations protégées par hébergement",
        "Liens invités sécurisés",
        "Historique des dialogues et statistiques",
        "Menus de restaurants et réservations",
        "Alertes WhatsApp pour les sujets importants",
      ],
      techLabel: "Base technique",
      techStack: ["Next.js", "OpenAI", "Supabase", "Twilio", "Vercel"],
    },
    contact: {
      eyebrow: "Contact",
      title: "Souhaitez-vous utiliser le Saas-Fee AI Concierge pour vos invités ?",
      text: "Envoyez un court message. La demande est enregistrée directement dans HubSpot afin d'assurer un suivi clair.",
    },
    demo: {
      eyebrow: "Démo",
      title:
        "Testez la manière dont le concierge IA répond dans l'interface dédiée aux invités.",
      cta: "Lancer le chat",
    },
    form: {
      website: "Site web",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      phone: "Téléphone",
      company: "Entreprise ou logement",
      message: "Message",
      messagePlaceholder:
        "Que souhaitez-vous améliorer dans votre logement ou service invités ?",
      consent:
        "J'accepte que mes informations soient enregistrées et utilisées dans HubSpot pour traiter cette demande.",
      submit: "Envoyer la demande",
      submitting: "Envoi...",
      success: "Merci. Votre message a été transmis à HubSpot.",
      fallbackError: "Le message n'a pas pu être envoyé.",
    },
    structuredDataPlace: "Saas-Fee, Suisse",
  },
  it: {
    lang: "it",
    label: "IT",
    path: "/it",
    metadata: {
      title: "Saas-Fee AI Concierge | Concierge IA pubblico per ospiti",
      description:
        "Concierge IA pubblico per ospiti e visitatori a Saas-Fee: ristoranti, attività, impianti di risalita, meteo, eventi, servizi locali e supporto al soggiorno 24/7.",
      keywords: [
        "Saas-Fee AI Concierge",
        "concierge Saas-Fee",
        "concierge IA Saas-Fee",
        "chatbot Saas-Fee",
        "ristoranti Saas-Fee",
        "attività Saas-Fee",
        "impianti Saas-Fee",
        "meteo Saas-Fee",
      ],
      locale: "it",
    },
    nav: {
      product: "Progetto",
      modules: "Moduli",
      contact: "Contatto",
      chat: "Apri chat",
    },
    hero: {
      eyebrow: "Concierge IA pubblico per Saas-Fee",
      title:
        "Il concierge digitale per ospiti, visitatori e soggiorni a Saas-Fee.",
      description:
        "Chieda direttamente informazioni su ristoranti, menu, attività, impianti di risalita, stato live, meteo, eventi, arrivo, sicurezza e servizi locali. Le strutture partner possono aggiungere informazioni protette.",
      audience:
        "Disponibile subito per gli ospiti. Integrabile per proprietari, appartamenti e hotel come servizio ospiti.",
      guestCta: "Prova come ospite",
      ownerCta: "Collega la mia struttura",
      imageAlt: "Panorama montano di Saas-Fee",
    },
    metrics: {
      eyebrow: "Già disponibile",
      items: [
        { value: "5", label: "Lingue dell'interfaccia" },
        { value: "24/7", label: "Risposte agli ospiti" },
        { value: "2", label: "Aree di conoscenza" },
        { value: "WhatsApp", label: "Avvisi e prenotazioni" },
      ],
    },
    product: {
      eyebrow: "Prodotto",
      title:
        "Un concierge per domande pubbliche su Saas-Fee e informazioni ospiti opzionali.",
      features: [
        {
          title: "Risposte 24/7",
          text: "Gli ospiti ricevono subito aiuto su ristoranti, impianti, meteo, eventi, arrivo, sicurezza, spesa, farmacia e attività.",
        },
        {
          title: "Conoscenza pubblica di Saas-Fee",
          text: "La chat separa le informazioni generali della destinazione dalle informazioni protette di strutture e hotel.",
        },
        {
          title: "Incidenti e WhatsApp",
          text: "Il concierge riconosce le richieste urgenti, crea un caso e può avvisare il proprietario o il team operativo via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Casi d'uso",
      title:
        "Il concierge risponde direttamente alle domande tipiche di ospiti e visitatori.",
      items: [
        "Un visitatore chiede quali ristoranti sono adatti oggi e vuole vedere menu con prezzi.",
        "Una famiglia cerca attività, parchi giochi, sentieri o idee per il maltempo.",
        "Un ospite chiede impianti aperti, meteo, bus, farmacia o negozi alimentari.",
        "Le strutture partner possono coprire anche check-in, Wi-Fi, regole della casa e incidenti.",
      ],
    },
    architecture: {
      eyebrow: "Operatività",
      title: "Affidabile, sicuro e pronto per l'uso con gli ospiti.",
      text: "Il concierge è pensato per la comunicazione quotidiana con gli ospiti: le informazioni pubbliche sulla destinazione restano separate da quelle protette della struttura, le richieste sono registrate in modo chiaro e i temi importanti possono essere inoltrati direttamente.",
      modules: [
        "Chat pubblica Saas-Fee",
        "Informazioni protette per struttura",
        "Link ospite sicuri",
        "Log delle conversazioni e statistiche",
        "Menu dei ristoranti e prenotazioni",
        "Avvisi WhatsApp per temi importanti",
      ],
      techLabel: "Base tecnica",
      techStack: ["Next.js", "OpenAI", "Supabase", "Twilio", "Vercel"],
    },
    contact: {
      eyebrow: "Contatto",
      title: "Vuole usare Saas-Fee AI Concierge per i suoi ospiti?",
      text: "Invii un breve messaggio. La richiesta viene registrata direttamente in HubSpot per un follow-up ordinato.",
    },
    demo: {
      eyebrow: "Demo",
      title:
        "Provi come il concierge IA risponde nell'interfaccia dedicata agli ospiti.",
      cta: "Avvia chat",
    },
    form: {
      website: "Sito web",
      firstName: "Nome",
      lastName: "Cognome",
      email: "E-mail",
      phone: "Telefono",
      company: "Azienda o alloggio",
      message: "Messaggio",
      messagePlaceholder:
        "Cosa vorrebbe migliorare nel suo alloggio o servizio ospiti?",
      consent:
        "Accetto che i miei dati siano salvati e utilizzati in HubSpot per elaborare questa richiesta.",
      submit: "Invia richiesta",
      submitting: "Invio...",
      success: "Grazie. Il suo messaggio è stato inviato a HubSpot.",
      fallbackError: "Non è stato possibile inviare il messaggio.",
    },
    structuredDataPlace: "Saas-Fee, Svizzera",
  },
};

export const landingLocales = Object.keys(landingCopies) as LandingLocale[];

export function getLandingCopy(locale: LandingLocale) {
  return landingCopies[locale];
}

export function getLandingMetadata(locale: LandingLocale): Metadata {
  const copy = getLandingCopy(locale);
  const languages = Object.fromEntries(
    landingLocales.map((item) => [
      landingCopies[item].lang,
      landingCopies[item].path,
    ])
  );

  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    keywords: copy.metadata.keywords,
    alternates: {
      canonical: copy.path,
      languages,
    },
    openGraph: {
      title: copy.metadata.title,
      description: copy.metadata.description,
      url: copy.path,
      siteName: "Saas-Fee AI Concierge",
      locale: copy.metadata.locale,
      type: "website",
      images: [
        {
          url: "/story/saas-fee-story-bg-clean.png",
          width: 941,
          height: 1672,
          alt: copy.hero.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metadata.title,
      description: copy.metadata.description,
      images: ["/story/saas-fee-story-bg-clean.png"],
    },
  };
}
