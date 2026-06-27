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
    pricing: string;
    contact: string;
    chat: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    audience: string;
    founderLine: string;
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
  pricing: {
    eyebrow: string;
    title: string;
    text: string;
    plans: Array<{
      name: string;
      price: string;
      annual: string;
      features: string[];
      note: string;
      featured?: boolean;
    }>;
    launchTitle: string;
    launchText: string;
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
      title: "Lena Concierge | Der KI-Concierge für Saas-Fee",
      description:
        "Lena ist die KI-Concierge für Gäste und Besucher in Saas-Fee: Restaurants, Aktivitäten, Bergbahnen, Wetter, Events, Ortsinfos und Aufenthaltsservice rund um die Uhr.",
      keywords: [
        "Lena Concierge",
        "Lena Saas-Fee",
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
      pricing: "Preise",
      contact: "Kontakt",
      chat: "Frag Lena",
    },
    hero: {
      eyebrow: "Lena Concierge",
      title: "Lerne Lena kennen - deine KI-Concierge in Saas-Fee.",
      description:
        "Sofortige Antworten zu Restaurants, Aktivitäten, Bergbahnen, Wetter, Events, Anreise, Sicherheit und deiner Unterkunft.",
      audience:
        "Für Gäste sofort nutzbar. Für Eigentümer, Ferienwohnungen und Hotels als Gästeservice integrierbar.",
      founderLine: "Entwickelt von Willy für Gäste und Gastgeber in Saas-Fee.",
      guestCta: "Frag Lena",
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
        "Lena beantwortet öffentliche Saas-Fee-Fragen und optionale Gästeinformationen.",
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
          text: "Lena erkennt dringende Anliegen, erstellt einen Vorgang und kann Eigentümer oder Betriebsteam per WhatsApp informieren.",
        },
      ],
    },
    useCases: {
      eyebrow: "Anwendungsfälle",
      title:
        "Lena beantwortet typische Gäste- und Besucherfragen direkt im Chat.",
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
      text: "Lena ist für den täglichen Gästekontakt ausgelegt: öffentliche Ortsinformationen bleiben von geschützten Objektinformationen getrennt, Anfragen werden nachvollziehbar protokolliert und wichtige Anliegen können direkt weitergeleitet werden.",
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
    pricing: {
      eyebrow: "Preise",
      title: "Transparente Einstiegspakete für Gastgeber in Saas-Fee.",
      text: "Die Pakete sind so aufgebaut, dass Eigentümer mit einer Wohnung risikoarm starten und später auf weitere Objekte erweitern können. Professional ist der empfohlene Standard für aktive Gastgeber.",
      plans: [
        {
          name: "Pilot",
          price: "CHF 89 / Monat",
          annual: "Jährlich: CHF 890",
          features: [
            "1 Ferienwohnung",
            "Gästelink und QR-Code",
            "Objektbezogene Wissensbasis",
            "Allgemeines Saas-Fee-Wissen",
            "Grundauswertung der Fragen",
          ],
          note: "Einrichtung einmalig: CHF 490",
        },
        {
          name: "Professional",
          price: "CHF 249 / Monat",
          annual: "Jährlich: CHF 2'490",
          features: [
            "Bis zu 3 Ferienwohnungen",
            "Mehrsprachiges Gästeinterface",
            "WhatsApp-Benachrichtigungen bei Vorfällen",
            "Restaurant- und Aktivitätsfragen",
            "Monatliche Optimierung der Wissensbasis",
          ],
          note: "Einrichtung einmalig: CHF 790. Weitere Wohnungen: CHF 59 / Monat pro Objekt.",
          featured: true,
        },
        {
          name: "Verwaltung",
          price: "Ab CHF 590 / Monat",
          annual: "Jährlich: ab CHF 5'900",
          features: [
            "Bis zu 10 Ferienwohnungen",
            "Eigene Prozesse und Eskalationsregeln",
            "Erweiterte Auswertungen",
            "Individuelle Integrationen",
            "Priorisierte Betreuung",
          ],
          note: "Einrichtung ab CHF 1'500. Weitere Wohnungen: CHF 39-49 / Monat pro Objekt.",
        },
      ],
      launchTitle: "Einführungsangebot für Eigentümer in Saas-Fee",
      launchText:
        "Pilot für CHF 69 / Monat während der ersten 3 Monate, danach CHF 89 / Monat. Ideal, um Lena mit einer konkreten Wohnung und echten Gästeanfragen zu testen.",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Möchten Sie Lena Concierge für Gäste nutzen?",
      text: "Senden Sie eine kurze Nachricht. Die Anfrage wird direkt in HubSpot erfasst, damit sie sauber nachverfolgt werden kann.",
    },
    demo: {
      eyebrow: "Demo",
      title: "Testen Sie, wie Lena im echten Gästeinterface antwortet.",
      cta: "Frag Lena",
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
      title: "Lena Concierge | The AI Concierge for Saas-Fee",
      description:
        "Lena is the AI concierge for guests and visitors in Saas-Fee: restaurants, activities, mountain railways, weather, events, local services, and stay support around the clock.",
      keywords: [
        "Lena Concierge",
        "Lena Saas-Fee",
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
      pricing: "Pricing",
      contact: "Contact",
      chat: "Ask Lena",
    },
    hero: {
      eyebrow: "Lena Concierge",
      title: "Meet Lena, your AI concierge in Saas-Fee.",
      description:
        "Instant answers about restaurants, activities, lifts, weather, events, arrival, safety, and your accommodation.",
      audience:
        "Ready for guests now. Available for apartment owners and hotels as an integrated guest service.",
      founderLine: "Created by Willy for Saas-Fee guests and hosts.",
      guestCta: "Ask Lena",
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
      title: "Lena answers public Saas-Fee questions and optional guest information.",
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
          text: "Lena detects urgent requests, creates a case, and can notify the owner or operations team via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Use cases",
      title: "Lena answers typical guest and visitor questions directly in chat.",
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
      text: "Lena is built for everyday guest communication: public destination information stays separate from protected property information, requests are logged clearly, and important issues can be forwarded directly.",
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
    pricing: {
      eyebrow: "Pricing",
      title: "Clear entry packages for hosts in Saas-Fee.",
      text: "The packages let owners start safely with one apartment and expand to more properties later. Professional is the recommended standard for active hosts.",
      plans: [
        {
          name: "Pilot",
          price: "CHF 89 / month",
          annual: "Annual: CHF 890",
          features: [
            "1 holiday apartment",
            "Guest link and QR code",
            "Property-specific knowledge base",
            "General Saas-Fee knowledge",
            "Basic question analytics",
          ],
          note: "One-time setup: CHF 490",
        },
        {
          name: "Professional",
          price: "CHF 249 / month",
          annual: "Annual: CHF 2'490",
          features: [
            "Up to 3 holiday apartments",
            "Multilingual guest interface",
            "WhatsApp alerts for incidents",
            "Restaurant and activity questions",
            "Monthly knowledge-base optimization",
          ],
          note: "One-time setup: CHF 790. Additional apartments: CHF 59 / month per property.",
          featured: true,
        },
        {
          name: "Management",
          price: "From CHF 590 / month",
          annual: "Annual: from CHF 5'900",
          features: [
            "Up to 10 holiday apartments",
            "Custom processes and escalation rules",
            "Advanced analytics",
            "Individual integrations",
            "Priority support",
          ],
          note: "Setup from CHF 1'500. Additional apartments: CHF 39-49 / month per property.",
        },
      ],
      launchTitle: "Introductory offer for owners in Saas-Fee",
      launchText:
        "Pilot for CHF 69 / month during the first 3 months, then CHF 89 / month. Ideal for testing Lena with one real apartment and real guest questions.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Would you like to use Lena Concierge for guests?",
      text: "Send a short message. The request is recorded directly in HubSpot for a clear follow-up.",
    },
    demo: {
      eyebrow: "Demo",
      title: "Test how Lena responds in the real guest interface.",
      cta: "Ask Lena",
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
      title: "Lena Concierge | Le concierge IA pour Saas-Fee",
      description:
        "Lena est la concierge IA pour les invités et visiteurs de Saas-Fee : restaurants, activités, remontées mécaniques, météo, événements, services locaux et aide au séjour 24 h/24.",
      keywords: [
        "Lena Concierge",
        "Lena Saas-Fee",
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
      pricing: "Prix",
      contact: "Contact",
      chat: "Demander à Lena",
    },
    hero: {
      eyebrow: "Lena Concierge",
      title: "Découvrez Lena, votre concierge IA à Saas-Fee.",
      description:
        "Des réponses immédiates sur les restaurants, activités, remontées mécaniques, météo, événements, arrivée, sécurité et votre hébergement.",
      audience:
        "Disponible dès maintenant pour les visiteurs. Intégrable pour propriétaires, appartements et hôtels comme service invités.",
      founderLine: "Créé par Willy pour les invités et hôtes de Saas-Fee.",
      guestCta: "Demander à Lena",
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
        "Lena répond aux questions publiques sur Saas-Fee et aux informations invités optionnelles.",
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
          text: "Lena détecte les demandes urgentes, crée un dossier et peut informer le propriétaire ou l'équipe d'exploitation via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Cas d'utilisation",
      title:
        "Lena répond directement aux questions typiques des invités et visiteurs.",
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
      text: "Lena est conçue pour la communication quotidienne avec les invités : les informations publiques de la destination restent séparées des informations protégées des hébergements, les demandes sont consignées clairement et les sujets importants peuvent être transmis directement.",
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
    pricing: {
      eyebrow: "Prix",
      title: "Des formules claires pour les hôtes à Saas-Fee.",
      text: "Les formules permettent de commencer avec un appartement, puis d'étendre le service à d'autres hébergements. Professional est la formule recommandée pour les hôtes actifs.",
      plans: [
        {
          name: "Pilot",
          price: "CHF 89 / mois",
          annual: "Annuel : CHF 890",
          features: [
            "1 appartement de vacances",
            "Lien invité et QR code",
            "Base de connaissances propre au logement",
            "Connaissance générale de Saas-Fee",
            "Analyse de base des questions",
          ],
          note: "Configuration unique : CHF 490",
        },
        {
          name: "Professional",
          price: "CHF 249 / mois",
          annual: "Annuel : CHF 2'490",
          features: [
            "Jusqu'à 3 appartements de vacances",
            "Interface invités multilingue",
            "Alertes WhatsApp en cas d'incident",
            "Questions sur restaurants et activités",
            "Optimisation mensuelle de la base de connaissances",
          ],
          note: "Configuration unique : CHF 790. Appartements supplémentaires : CHF 59 / mois par objet.",
          featured: true,
        },
        {
          name: "Gestion",
          price: "Dès CHF 590 / mois",
          annual: "Annuel : dès CHF 5'900",
          features: [
            "Jusqu'à 10 appartements de vacances",
            "Processus et règles d'escalade personnalisés",
            "Analyses avancées",
            "Intégrations individuelles",
            "Accompagnement prioritaire",
          ],
          note: "Configuration dès CHF 1'500. Appartements supplémentaires : CHF 39-49 / mois par objet.",
        },
      ],
      launchTitle: "Offre de lancement pour propriétaires à Saas-Fee",
      launchText:
        "Pilot à CHF 69 / mois pendant les 3 premiers mois, puis CHF 89 / mois. Idéal pour tester Lena avec un logement concret et de vraies questions d'invités.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Souhaitez-vous utiliser Lena Concierge pour vos invités ?",
      text: "Envoyez un court message. La demande est enregistrée directement dans HubSpot afin d'assurer un suivi clair.",
    },
    demo: {
      eyebrow: "Démo",
      title: "Testez la manière dont Lena répond dans l'interface dédiée aux invités.",
      cta: "Demander à Lena",
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
      title: "Lena Concierge | Il concierge IA per Saas-Fee",
      description:
        "Lena è la concierge IA per ospiti e visitatori a Saas-Fee: ristoranti, attività, impianti di risalita, meteo, eventi, servizi locali e supporto al soggiorno 24/7.",
      keywords: [
        "Lena Concierge",
        "Lena Saas-Fee",
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
      pricing: "Prezzi",
      contact: "Contatto",
      chat: "Chiedi a Lena",
    },
    hero: {
      eyebrow: "Lena Concierge",
      title: "Conosci Lena, la tua concierge IA a Saas-Fee.",
      description:
        "Risposte immediate su ristoranti, attività, impianti, meteo, eventi, arrivo, sicurezza e il tuo alloggio.",
      audience:
        "Disponibile subito per gli ospiti. Integrabile per proprietari, appartamenti e hotel come servizio ospiti.",
      founderLine: "Creato da Willy per ospiti e host di Saas-Fee.",
      guestCta: "Chiedi a Lena",
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
        "Lena risponde alle domande pubbliche su Saas-Fee e alle informazioni ospiti opzionali.",
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
          text: "Lena riconosce le richieste urgenti, crea un caso e può avvisare il proprietario o il team operativo via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Casi d'uso",
      title:
        "Lena risponde direttamente alle domande tipiche di ospiti e visitatori.",
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
      text: "Lena è pensata per la comunicazione quotidiana con gli ospiti: le informazioni pubbliche sulla destinazione restano separate da quelle protette della struttura, le richieste sono registrate in modo chiaro e i temi importanti possono essere inoltrati direttamente.",
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
    pricing: {
      eyebrow: "Prezzi",
      title: "Pacchetti chiari per host a Saas-Fee.",
      text: "I pacchetti permettono di iniziare con un appartamento e poi estendere il servizio ad altre strutture. Professional è lo standard consigliato per host attivi.",
      plans: [
        {
          name: "Pilot",
          price: "CHF 89 / mese",
          annual: "Annuale: CHF 890",
          features: [
            "1 appartamento vacanze",
            "Link ospite e QR code",
            "Base di conoscenza specifica della struttura",
            "Conoscenza generale di Saas-Fee",
            "Analisi base delle domande",
          ],
          note: "Configurazione una tantum: CHF 490",
        },
        {
          name: "Professional",
          price: "CHF 249 / mese",
          annual: "Annuale: CHF 2'490",
          features: [
            "Fino a 3 appartamenti vacanze",
            "Interfaccia ospiti multilingue",
            "Avvisi WhatsApp per incidenti",
            "Domande su ristoranti e attività",
            "Ottimizzazione mensile della base di conoscenza",
          ],
          note: "Configurazione una tantum: CHF 790. Appartamenti aggiuntivi: CHF 59 / mese per struttura.",
          featured: true,
        },
        {
          name: "Gestione",
          price: "Da CHF 590 / mese",
          annual: "Annuale: da CHF 5'900",
          features: [
            "Fino a 10 appartamenti vacanze",
            "Processi e regole di escalation personalizzati",
            "Analisi avanzate",
            "Integrazioni individuali",
            "Supporto prioritario",
          ],
          note: "Configurazione da CHF 1'500. Appartamenti aggiuntivi: CHF 39-49 / mese per struttura.",
        },
      ],
      launchTitle: "Offerta introduttiva per proprietari a Saas-Fee",
      launchText:
        "Pilot a CHF 69 / mese per i primi 3 mesi, poi CHF 89 / mese. Ideale per testare Lena con un appartamento concreto e domande reali degli ospiti.",
    },
    contact: {
      eyebrow: "Contatto",
      title: "Vuole usare Lena Concierge per i suoi ospiti?",
      text: "Invii un breve messaggio. La richiesta viene registrata direttamente in HubSpot per un follow-up ordinato.",
    },
    demo: {
      eyebrow: "Demo",
      title: "Provi come Lena risponde nell'interfaccia dedicata agli ospiti.",
      cta: "Chiedi a Lena",
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
      siteName: "Lena Concierge",
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
