import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt | Saas-Fee Concierge",
  description:
    "Kontaktmöglichkeiten für den Saas-Fee Concierge und die Lena Owner App.",
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#211e18]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-[#211e18]/14 pb-6">
          <Link
            className="text-sm font-semibold text-[#2e4a3a] underline decoration-[#9fc0a8] underline-offset-2 transition hover:text-[#1f3d33]"
            href="/"
          >
            Zurück zum Concierge
          </Link>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-[#dc6b43]">
            Saas-Fee Concierge
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#211e18] sm:text-4xl">
            Kontakt
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5c5648]">
            Fragen zum Concierge, zur Lena Owner App oder zu einer Partnerschaft?
            Wir sind gerne für Sie da.
          </p>
        </header>

        <div className="space-y-6 py-6">
          <section className="rounded-lg border border-[#211e18]/14 bg-[#fcfaf4] p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211e18]">
              Allgemeine Anfragen
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[#344039]">
              <p>
                E-Mail:{" "}
                <a
                  className="text-[#2e4a3a] underline"
                  href="mailto:hallo@saas-fee-concierge.ch"
                >
                  hallo@saas-fee-concierge.ch
                </a>
              </p>
              <p>
                Web:{" "}
                <a
                  className="text-[#2e4a3a] underline"
                  href="https://saas-fee-concierge.ch"
                >
                  saas-fee-concierge.ch
                </a>
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[#211e18]/14 bg-[#fcfaf4] p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211e18]">Datenschutz</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[#344039]">
              <p>
                Anfragen zum Datenschutz:{" "}
                <a
                  className="text-[#2e4a3a] underline"
                  href="mailto:privacy@willy-agency.com"
                >
                  privacy@willy-agency.com
                </a>
              </p>
              <p>
                Siehe auch unsere{" "}
                <Link className="text-[#2e4a3a] underline" href="/datenschutz">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[#211e18]/14 bg-[#fcfaf4] p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211e18]">
                Direkt mit Lena sprechen
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#344039]">
              Die schnellste Antwort auf Aufenthaltsfragen erhalten Sie direkt
              im Chat mit Lena.
            </p>
            <Link
              className="mt-4 inline-block rounded-lg bg-[#dc6b43] px-5 py-2.5 text-sm font-semibold text-[#211e18] transition hover:bg-[#c2552f]"
              href="/chat"
            >
              Mit Lena sprechen
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
