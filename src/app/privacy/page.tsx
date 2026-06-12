import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Saas-Fee AI Concierge",
  description:
    "Datenschutzerklärung für die Saas-Fee AI Concierge Anwendung.",
};

const sections = [
  {
    title: "1. Verantwortlicher",
    body: [
      "Diese Datenschutzerklärung gilt für die Anwendung Saas-Fee AI Concierge. Verantwortlich für den Betrieb der Anwendung ist Willy Agency.",
      "Kontakt für Datenschutzanfragen: privacy@willy-agency.com",
    ],
  },
  {
    title: "2. Zweck der Anwendung",
    body: [
      "Saas-Fee AI Concierge unterstützt Gäste während ihres Aufenthalts mit Informationen zur Unterkunft, Restaurants, Aktivitäten, Bergbahnen, Wetter, lokalen Empfehlungen und Serviceanfragen.",
      "Die Anwendung kann Gespräche protokollieren, Supportfälle erstellen und Reservierungsanfragen an Restaurants vorbereiten oder versenden.",
    ],
  },
  {
    title: "3. Welche Daten verarbeitet werden",
    body: [
      "Wir verarbeiten die Daten, die Sie freiwillig im Chat eingeben. Dazu können Name, E-Mail-Adresse, Telefonnummer oder WhatsApp-Kontakt, Aufenthalts- oder Unterkunftsbezug, Chatnachrichten, Reservierungsdetails, besondere Wünsche und technische Kontextdaten gehören.",
      "Bei Gastlinks können propertyId oder Zugriffstoken verwendet werden, damit lokale Informationen nur für berechtigte Gäste angezeigt werden.",
      "Bei WhatsApp-Reservierungen können Restaurantname, Datum, Uhrzeit, Anzahl Personen, Name, Kontakt und besondere Wünsche verarbeitet werden.",
    ],
  },
  {
    title: "4. Warum Daten verarbeitet werden",
    body: [
      "Die Daten werden verarbeitet, um Chatantworten zu erzeugen, lokale Informationen korrekt bereitzustellen, Gespräche nachvollziehbar zu protokollieren, Servicefälle zu bearbeiten, Reservierungsanfragen zu ermöglichen und die Qualität des Concierge-Dienstes zu verbessern.",
      "Aggregierte Statistiken können genutzt werden, um häufige Fragen, gewünschte Restaurants, Aktivitäten und andere Themen besser zu verstehen.",
    ],
  },
  {
    title: "5. Eingesetzte Dienstleister",
    body: [
      "Die Anwendung nutzt technische Dienstleister, um den Dienst bereitzustellen. Dazu können insbesondere Vercel für Hosting, Supabase für Datenbankdienste, OpenAI für KI-Antworten und Meta/WhatsApp für WhatsApp-Kommunikation gehören.",
      "An diese Dienstleister werden nur Daten übermittelt, soweit dies für den Betrieb, die Beantwortung von Anfragen, die Speicherung von Gesprächen oder die Kommunikation erforderlich ist.",
    ],
  },
  {
    title: "6. KI-Verarbeitung",
    body: [
      "Chatnachrichten können an OpenAI übermittelt werden, damit die KI eine passende Antwort erzeugen kann. Die Anwendung weist die KI an, die bereitgestellten Kontextdaten als Wissensquelle zu nutzen und keine nicht vorhandenen Kontaktdaten zu erfinden.",
      "Bitte geben Sie keine sensiblen Daten ein, die für Ihre Anfrage nicht erforderlich sind.",
    ],
  },
  {
    title: "7. WhatsApp und Restaurantreservierungen",
    body: [
      "Wenn Sie eine Restaurantreservierung anfragen, kann die Anwendung die Reservierungsdaten speichern und über WhatsApp Business Platform an das jeweilige Restaurant senden.",
      "Eine Reservierung gilt erst als bestätigt, wenn das Restaurant die Anfrage bestätigt. Die Anwendung erstellt zunächst nur eine Reservierungsanfrage.",
    ],
  },
  {
    title: "8. Speicherung und Löschung",
    body: [
      "Gespräche, Supportfälle, Reservierungsanfragen und Nutzungsstatistiken werden nur so lange gespeichert, wie es für Betrieb, Gästeservice, Qualitätssicherung und berechtigte Nachvollziehbarkeit erforderlich ist.",
      "Sie können die Löschung oder Korrektur personenbezogener Daten anfragen, soweit keine gesetzlichen oder berechtigten Aufbewahrungsgründe entgegenstehen.",
    ],
  },
  {
    title: "9. Ihre Rechte",
    body: [
      "Sie können Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung oder Übertragung Ihrer personenbezogenen Daten verlangen, soweit die gesetzlichen Voraussetzungen erfüllt sind.",
      "Sie können außerdem der Verarbeitung widersprechen oder eine erteilte Einwilligung mit Wirkung für die Zukunft widerrufen.",
    ],
  },
  {
    title: "10. Sicherheit",
    body: [
      "Wir verwenden angemessene technische und organisatorische Maßnahmen, um Daten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen.",
      "Serverseitige Schlüssel, Datenbank-Zugangsdaten und API-Keys werden nicht im öffentlichen Client-Code bereitgestellt.",
    ],
  },
  {
    title: "11. Änderungen dieser Datenschutzerklärung",
    body: [
      "Diese Datenschutzerklärung kann angepasst werden, wenn sich die Anwendung, eingesetzte Dienstleister oder rechtliche Anforderungen ändern.",
      "Stand: 12. Juni 2026",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#1f2421]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-[#d8d8ce] pb-6">
          <Link
            className="text-sm font-semibold text-[#1f5f46] underline decoration-[#9db8a9] underline-offset-2 transition hover:text-[#123d2d]"
            href="/"
          >
            Zurück zum Concierge
          </Link>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-[#5b6b5f]">
            Saas-Fee AI Concierge
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#151815] sm:text-4xl">
            Datenschutzerklärung
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b6b5f]">
            Diese Seite erklärt, wie personenbezogene Daten in der Anwendung
            Saas-Fee AI Concierge verarbeitet werden.
          </p>
        </header>

        <div className="space-y-6 py-6">
          {sections.map((section) => (
            <section
              className="rounded-lg border border-[#d8d8ce] bg-white p-5 shadow-sm"
              key={section.title}
            >
              <h2 className="text-lg font-semibold text-[#151815]">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[#344039]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
