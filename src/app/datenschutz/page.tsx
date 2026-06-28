import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz | Lena Owner App",
  description:
    "Datenschutzerklärung für die Lena Owner App — die Vermieter-App des Saas-Fee Concierge.",
};

const PLACEHOLDER = "[bitte ergänzen]";

const sections = [
  {
    title: "1. Verantwortliche Stelle",
    body: [
      "Verantwortlich für die Datenverarbeitung in der Lena Owner App ist Willy Agency.",
      `Anschrift: ${PLACEHOLDER}. Kontakt für Datenschutzanfragen: privacy@willy-agency.com`,
    ],
  },
  {
    title: "2. Zweck der App",
    body: [
      "Die Lena Owner App richtet sich an Eigentümer und Vermieter in Saas-Fee. Sie zeigt statistische Auswertungen der Gästeanfragen an den digitalen Concierge Lena für das eigene Objekt und ermöglicht das Pflegen objektbezogener Informationen wie Check-in, WLAN, Hausregeln und häufige Fragen.",
    ],
  },
  {
    title: "3. Welche Daten verarbeitet werden",
    body: [
      "Kontodaten: Ihre E-Mail-Adresse zur Anmeldung und Authentifizierung.",
      "Sitzungsdaten: technische Anmelde-Token, die lokal auf Ihrem Gerät gespeichert werden, um Sie angemeldet zu halten.",
      "Objektdaten: die von Ihnen gepflegten Informationen und Antworten zu Ihrer Unterkunft.",
      "Auswertungsdaten: aggregierte Statistiken zu Gästeanfragen Ihres Objekts (Anzahl, Themen, Vorfälle).",
      "Die App erhebt keine Standortdaten, keine Kontakte, keine Fotos und nutzt kein Tracking zu Werbezwecken.",
    ],
  },
  {
    title: "4. Rechtsgrundlagen",
    body: [
      "Die Verarbeitung erfolgt auf Grundlage des Vertragsverhältnisses zur Bereitstellung des Dienstes (Art. 6 Abs. 1 lit. b DSGVO bzw. entsprechende Bestimmungen des Schweizer DSG) sowie Ihrer Einwilligung, soweit erforderlich.",
    ],
  },
  {
    title: "5. Auftragsverarbeiter",
    body: [
      "Supabase — Datenbank und Authentifizierung.",
      "OpenAI — Erzeugung von Text-Embeddings beim Speichern von Objektinformationen, damit der Concierge sie auffinden kann.",
      "Expo / EAS sowie Apple App Store und Google Play — Auslieferung und Betrieb der App.",
    ],
  },
  {
    title: "6. Speicherdauer",
    body: [
      "Kontodaten werden gespeichert, solange Ihr Zugang besteht. Nach Löschung des Kontos werden personenbezogene Daten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
    ],
  },
  {
    title: "7. Ihre Rechte",
    body: [
      "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Wenden Sie sich dazu an die oben genannte Kontaktadresse.",
      "Zudem besteht ein Beschwerderecht bei der zuständigen Aufsichtsbehörde (in der Schweiz: EDÖB).",
    ],
  },
  {
    title: "8. Datensicherheit",
    body: [
      "Der Zugang ist durch Anmeldung geschützt. Jeder Vermieter sieht ausschliesslich die Daten des eigenen Objekts; die technische Zugriffstrennung wird serverseitig durchgesetzt. Die Übertragung erfolgt verschlüsselt über HTTPS/TLS.",
    ],
  },
  {
    title: "9. Änderungen",
    body: [
      "Diese Erklärung wird angepasst, wenn sich die App oder rechtliche Vorgaben ändern. Die jeweils aktuelle Fassung ist unter dieser Adresse abrufbar.",
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#211e18]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-[#211e18]/14 pb-6">
          <Link
            className="text-sm font-semibold text-[#2e4a3a] underline decoration-[#9fc0a8] underline-offset-2 transition hover:text-[#1f3d33]"
            href="/"
          >
            Zurück zum Concierge
          </Link>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-[#dc6b43]">
            Lena Owner App
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#211e18] sm:text-4xl">
            Datenschutzerklärung
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5c5648]">
            Diese Seite erklärt, wie personenbezogene Daten in der Lena Owner App
            — der Vermieter-App des Saas-Fee Concierge — verarbeitet werden.
          </p>
        </header>

        <div className="space-y-6 py-6">
          {sections.map((section) => (
            <section
              className="rounded-lg border border-[#211e18]/14 bg-[#fcfaf4] p-5 shadow-sm"
              key={section.title}
            >
              <h2 className="text-lg font-semibold text-[#211e18]">
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

        <footer className="border-t border-[#211e18]/14 py-6 text-sm text-[#5c5648]">
          Saas-Fee Concierge ·{" "}
          <Link className="text-[#2e4a3a] underline" href="/kontakt">
            Kontakt
          </Link>
        </footer>
      </div>
    </main>
  );
}
