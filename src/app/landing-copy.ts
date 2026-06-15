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
      title: "Saas-Fee AI Concierge | KI-Gästeservice für Ferienwohnungen",
      description:
        "KI-Concierge für Ferienwohnungen in Saas-Fee: beantwortet Gästeanfragen rund um die Uhr, nutzt objektbezogenes Wissen und informiert Teams per WhatsApp.",
      keywords: [
        "Saas-Fee AI Concierge",
        "KI Concierge Saas-Fee",
        "Gästeservice Ferienwohnungen",
        "Ferienwohnung Saas-Fee",
        "WhatsApp Gästeservice",
        "Hotel KI Chatbot",
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
      eyebrow: "KI-Concierge für Ferienwohnungen und Gäste in Saas-Fee",
      title:
        "Ein Gästeservice, der umgehend reagiert und Gästen rund um die Uhr zur Seite steht.",
      description:
        "Die Lösung verbindet einen öffentlichen Saas-Fee-Chat, geschütztes Wissen pro Unterkunft, Auswertungen der Gästeanfragen und WhatsApp-Benachrichtigungen für Situationen, in denen ein Mensch reagieren muss.",
      imageAlt: "Saas-Fee Bergpanorama mit Ferienwohnungen",
    },
    metrics: {
      eyebrow: "Bereits verfügbar",
      items: [
        { value: "5", label: "Sprachen im Interface" },
        { value: "24/7", label: "Antworten für Gäste" },
        { value: "2", label: "Wissensebenen" },
        { value: "WA", label: "Meldungen und Reservationen" },
      ],
    },
    product: {
      eyebrow: "Produkt",
      title:
        "Ein Concierge für öffentliche Fragen und private Details der Unterkunft.",
      features: [
        {
          title: "Antworten rund um die Uhr",
          text: "Gäste erhalten sofort Hilfe zu Unterkunft, Restaurants, Bergbahnen, Wetter, Events und Hausregeln, ohne auf das Team warten zu müssen.",
        },
        {
          title: "Objektbezogenes Wissen",
          text: "Persönliche Gästelinks öffnen geschützte Informationen zur jeweiligen Wohnung: Check-in, WLAN, Anleitungen, Kontakte und häufige Fragen.",
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
        "Der Service beantwortet wiederkehrende Fragen und markiert dringende Anliegen.",
      items: [
        "Ein Gast fragt, wo die Schlüssel liegen und wie er sich mit dem WLAN verbindet.",
        "Eine Familie sucht ein Restaurant und möchte Menüs mit Preisen sehen.",
        "Der Eigentümer erhält eine dringende Meldung zu einem Problem in der Wohnung.",
        "Das Betriebsteam sieht häufige Fragen und verbessert die Wissensbasis gezielt.",
      ],
    },
    architecture: {
      eyebrow: "Architektur",
      title:
        "Next.js, OpenAI, Supabase und WhatsApp in einem einsatznahen Prototyp.",
      text: "Die Anwendung speichert Dialoge, trennt allgemeines und objektbezogenes Wissen, arbeitet mit sicheren Gästelinks und ist für den Betrieb auf Vercel vorbereitet.",
      modules: [
        "KI-Chat auf der Website",
        "Gästelinks mit Zugriffstoken",
        "Supabase Wissensdatenbank",
        "Dialogprotokolle und Analytics",
        "Restaurantmenüs und Reservationen",
        "Twilio WhatsApp Webhooks",
      ],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Möchten Sie den KI-Concierge für Ihre Unterkunft testen?",
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
      title: "Saas-Fee AI Concierge | AI Guest Service for Apartments",
      description:
        "AI concierge for holiday apartments in Saas-Fee: answers guest questions around the clock, uses property-specific knowledge, and alerts teams via WhatsApp.",
      keywords: [
        "Saas-Fee AI Concierge",
        "AI concierge Saas-Fee",
        "guest service holiday apartments",
        "Saas-Fee apartment",
        "WhatsApp guest service",
        "hotel AI chatbot",
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
      eyebrow: "AI concierge for holiday apartments and guests in Saas-Fee",
      title:
        "A guest service that responds immediately and supports guests around the clock.",
      description:
        "The solution combines a public Saas-Fee chat, protected knowledge for each property, guest request analytics, and WhatsApp notifications for situations where a person needs to respond.",
      imageAlt: "Saas-Fee mountain panorama with holiday apartments",
    },
    metrics: {
      eyebrow: "Already available",
      items: [
        { value: "5", label: "Interface languages" },
        { value: "24/7", label: "Answers for guests" },
        { value: "2", label: "Knowledge layers" },
        { value: "WA", label: "Alerts and reservations" },
      ],
    },
    product: {
      eyebrow: "Product",
      title: "One concierge for public questions and private property details.",
      features: [
        {
          title: "Answers around the clock",
          text: "Guests get immediate help with accommodation, restaurants, mountain railways, weather, events, and house rules without waiting for the team.",
        },
        {
          title: "Property-specific knowledge",
          text: "Personal guest links open protected information for the relevant apartment: check-in, Wi-Fi, instructions, contacts, and FAQs.",
        },
        {
          title: "Incidents and WhatsApp",
          text: "The concierge detects urgent requests, creates a case, and can notify the owner or operations team via WhatsApp.",
        },
      ],
    },
    useCases: {
      eyebrow: "Use cases",
      title: "The service answers recurring questions and highlights urgent issues.",
      items: [
        "A guest asks where the keys are and how to connect to Wi-Fi.",
        "A family chooses a restaurant and wants to see menus with prices.",
        "The owner receives an urgent alert about an issue in the apartment.",
        "The operations team sees frequent questions and improves the knowledge base.",
      ],
    },
    architecture: {
      eyebrow: "Architecture",
      title: "Next.js, OpenAI, Supabase, and WhatsApp in a deployment-ready prototype.",
      text: "The application stores conversations, separates general and property-specific knowledge, works with secure guest links, and is ready to run on Vercel.",
      modules: [
        "AI chat on the website",
        "Guest links with access tokens",
        "Supabase knowledge base",
        "Conversation logs and analytics",
        "Restaurant menus and reservations",
        "Twilio WhatsApp webhooks",
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Would you like to test the AI concierge for your property?",
      text: "Send a short message. The request is recorded directly in HubSpot so it can be followed up cleanly.",
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
      title: "Saas-Fee AI Concierge | Service invités IA pour appartements",
      description:
        "Concierge IA pour appartements de vacances à Saas-Fee : répond aux questions des invités 24 h/24, utilise les informations propres au logement et alerte les équipes via WhatsApp.",
      keywords: [
        "Saas-Fee AI Concierge",
        "concierge IA Saas-Fee",
        "service invités appartements de vacances",
        "appartement Saas-Fee",
        "service invités WhatsApp",
        "chatbot IA hôtel",
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
      eyebrow: "Concierge IA pour appartements de vacances et invités à Saas-Fee",
      title:
        "Un service invités qui répond immédiatement et accompagne les invités 24 h/24.",
      description:
        "La solution réunit un chat public pour Saas-Fee, des informations protégées par logement, l'analyse des demandes invités et des notifications WhatsApp pour les situations nécessitant une intervention humaine.",
      imageAlt: "Panorama de montagne à Saas-Fee avec appartements de vacances",
    },
    metrics: {
      eyebrow: "Déjà disponible",
      items: [
        { value: "5", label: "Langues d'interface" },
        { value: "24/7", label: "Réponses aux invités" },
        { value: "2", label: "Niveaux de connaissance" },
        { value: "WA", label: "Alertes et réservations" },
      ],
    },
    product: {
      eyebrow: "Produit",
      title:
        "Un concierge pour les questions publiques et les détails privés du logement.",
      features: [
        {
          title: "Réponses 24 h/24",
          text: "Les invités obtiennent une aide immédiate sur le logement, les restaurants, les remontées mécaniques, la météo, les événements et les règles de la maison.",
        },
        {
          title: "Connaissance propre au logement",
          text: "Les liens invités personnels ouvrent les informations protégées du logement concerné : check-in, Wi-Fi, consignes, contacts et FAQ.",
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
        "Le service répond aux questions récurrentes et signale les demandes urgentes.",
      items: [
        "Un invité demande où se trouvent les clés et comment se connecter au Wi-Fi.",
        "Une famille choisit un restaurant et souhaite voir les menus avec les prix.",
        "Le propriétaire reçoit une alerte urgente concernant un problème dans l'appartement.",
        "L'équipe d'exploitation identifie les questions fréquentes et améliore la base de connaissances.",
      ],
    },
    architecture: {
      eyebrow: "Architecture",
      title:
        "Next.js, OpenAI, Supabase et WhatsApp dans un prototype prêt au déploiement.",
      text: "L'application conserve les conversations, sépare les connaissances générales et propres au logement, fonctionne avec des liens invités sécurisés et est prête pour Vercel.",
      modules: [
        "Chat IA sur le site",
        "Liens invités avec jetons d'accès",
        "Base de connaissances Supabase",
        "Historique des dialogues et analytics",
        "Menus de restaurants et réservations",
        "Webhooks WhatsApp Twilio",
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Souhaitez-vous tester le concierge IA pour votre logement ?",
      text: "Envoyez un court message. La demande est enregistrée directement dans HubSpot afin d'assurer un suivi clair.",
    },
    demo: {
      eyebrow: "Démo",
      title:
        "Testez la manière dont le concierge IA répond dans la véritable interface invité.",
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
      title: "Saas-Fee AI Concierge | Servizio ospiti IA per appartamenti",
      description:
        "Concierge IA per appartamenti vacanza a Saas-Fee: risponde alle domande degli ospiti 24/7, usa conoscenze specifiche della proprietà e avvisa i team via WhatsApp.",
      keywords: [
        "Saas-Fee AI Concierge",
        "concierge IA Saas-Fee",
        "servizio ospiti appartamenti vacanza",
        "appartamento Saas-Fee",
        "servizio ospiti WhatsApp",
        "chatbot IA hotel",
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
      eyebrow: "Concierge IA per appartamenti vacanza e ospiti a Saas-Fee",
      title:
        "Un servizio ospiti che risponde subito e assiste gli ospiti 24 ore su 24.",
      description:
        "La soluzione unisce una chat pubblica per Saas-Fee, conoscenze protette per ogni alloggio, analisi delle richieste degli ospiti e notifiche WhatsApp per le situazioni che richiedono una risposta umana.",
      imageAlt: "Panorama montano di Saas-Fee con appartamenti vacanza",
    },
    metrics: {
      eyebrow: "Già disponibile",
      items: [
        { value: "5", label: "Lingue dell'interfaccia" },
        { value: "24/7", label: "Risposte agli ospiti" },
        { value: "2", label: "Livelli di conoscenza" },
        { value: "WA", label: "Avvisi e prenotazioni" },
      ],
    },
    product: {
      eyebrow: "Prodotto",
      title:
        "Un concierge per domande pubbliche e dettagli privati dell'alloggio.",
      features: [
        {
          title: "Risposte 24/7",
          text: "Gli ospiti ricevono subito aiuto su alloggio, ristoranti, impianti di risalita, meteo, eventi e regole della casa senza attendere il team.",
        },
        {
          title: "Conoscenza specifica dell'alloggio",
          text: "I link personali per gli ospiti aprono informazioni protette sull'appartamento: check-in, Wi-Fi, istruzioni, contatti e FAQ.",
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
        "Il servizio risponde alle domande ricorrenti e segnala le richieste urgenti.",
      items: [
        "Un ospite chiede dove si trovano le chiavi e come collegarsi al Wi-Fi.",
        "Una famiglia sceglie un ristorante e vuole vedere i menu con i prezzi.",
        "Il proprietario riceve un avviso urgente per un problema nell'appartamento.",
        "Il team operativo vede le domande frequenti e migliora la base di conoscenza.",
      ],
    },
    architecture: {
      eyebrow: "Architettura",
      title:
        "Next.js, OpenAI, Supabase e WhatsApp in un prototipo pronto al deploy.",
      text: "L'applicazione salva le conversazioni, separa conoscenze generali e specifiche della proprietà, usa link ospite sicuri ed è pronta per Vercel.",
      modules: [
        "Chat IA sul sito",
        "Link ospite con token di accesso",
        "Base di conoscenza Supabase",
        "Log delle conversazioni e analytics",
        "Menu dei ristoranti e prenotazioni",
        "Webhook WhatsApp Twilio",
      ],
    },
    contact: {
      eyebrow: "Contatto",
      title: "Vuole testare il concierge IA per il suo alloggio?",
      text: "Invii un breve messaggio. La richiesta viene registrata direttamente in HubSpot per un follow-up ordinato.",
    },
    demo: {
      eyebrow: "Demo",
      title:
        "Provi come il concierge IA risponde nella vera interfaccia ospite.",
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
