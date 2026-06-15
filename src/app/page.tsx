import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const features = [
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
  ];

  const modules = [
    "KI-Chat auf der Website",
    "Gästelinks mit Zugriffstoken",
    "Supabase Wissensdatenbank",
    "Dialogprotokolle und Analytics",
    "Restaurantmenüs und Reservationen",
    "Twilio WhatsApp Webhooks",
  ];

  const useCases = [
    "Ein Gast fragt, wo die Schlüssel liegen und wie er sich mit dem WLAN verbindet.",
    "Eine Familie sucht ein Restaurant und möchte Menüs mit Preisen sehen.",
    "Der Eigentümer erhält eine dringende Meldung zu einem Problem in der Wohnung.",
    "Das Betriebsteam sieht häufige Fragen und verbessert die Wissensbasis gezielt.",
  ];

  return (
    <main className="min-h-screen bg-[#f5f4ed] text-[#18211d]">
      <section className="relative flex min-h-[92vh] overflow-hidden">
        <Image
          src="/story/saas-fee-story-bg-clean.png"
          alt="Saas-Fee mountain village"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0f1b17]/58" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[#f5f4ed]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col items-start justify-between gap-4 text-white sm:flex-row sm:items-center">
            <Link className="text-sm font-semibold uppercase tracking-[0.18em]" href="/">
              Saas-Fee AI Concierge
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                className="rounded-md px-3 py-2 font-medium text-white/82 transition hover:bg-white/12 hover:text-white"
                href="#product"
              >
                Projekt
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-white/82 transition hover:bg-white/12 hover:text-white"
                href="#architecture"
              >
                Module
              </a>
              <Link
                className="rounded-md bg-white px-4 py-2 font-semibold text-[#17362b] transition hover:bg-[#eef1e8]"
                href="/chat"
              >
                Chat öffnen
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-end gap-10 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-28">
            <div className="max-w-3xl text-white">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#d7e8d9]">
                KI-Concierge für Ferienwohnungen und Gäste in Saas-Fee
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-normal sm:text-6xl lg:text-7xl">
                Gästeservice, der sofort antwortet und Wichtiges ans Team weitergibt.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86">
                Die Lösung verbindet einen öffentlichen Saas-Fee-Chat,
                geschütztes Wissen pro Unterkunft, Auswertungen der Gästeanfragen
                und WhatsApp-Benachrichtigungen für Situationen, in denen ein
                Mensch reagieren muss.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-md bg-[#f0c85a] px-5 py-3 text-sm font-bold text-[#1e2418] transition hover:bg-[#ffd86b]"
                  href="/chat"
                >
                  Öffentlichen Chat testen
                </Link>
                <Link
                  className="rounded-md border border-white/42 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                  href="/story"
                >
                  Story ansehen
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-white/22 bg-white/92 p-5 text-[#18211d] shadow-2xl shadow-black/20 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3e6d5a]">
                Bereits verfügbar
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-3xl font-semibold">5</dt>
                  <dd className="mt-1 text-sm text-[#53615a]">Sprachen im Interface</dd>
                </div>
                <div>
                  <dt className="text-3xl font-semibold">24/7</dt>
                  <dd className="mt-1 text-sm text-[#53615a]">Antworten für Gäste</dd>
                </div>
                <div>
                  <dt className="text-3xl font-semibold">2</dt>
                  <dd className="mt-1 text-sm text-[#53615a]">Wissensebenen</dd>
                </div>
                <div>
                  <dt className="text-3xl font-semibold">WA</dt>
                  <dd className="mt-1 text-sm text-[#53615a]">Meldungen und Reservationen</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3e6d5a]">
              Produkt
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal text-[#15221d]">
              Ein Concierge für öffentliche Fragen und private Details der Unterkunft.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-[#d7d8ca] bg-white p-5 shadow-sm"
                key={feature.title}
              >
                <h3 className="text-lg font-semibold text-[#17231e]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#56635c]">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b3f35]">
              Anwendungsfälle
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">
              Der Service beantwortet wiederkehrende Fragen und markiert dringende Anliegen.
            </h2>
          </div>
          <ol className="space-y-3">
            {useCases.map((item, index) => (
              <li
                className="flex gap-4 rounded-lg border border-[#e2e0d4] bg-[#fbfaf5] p-4"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#244d40] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-[#3f4b45]">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#315f7d]">
              Architektur
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">
              Next.js, OpenAI, Supabase und WhatsApp in einem einsatznahen Prototyp.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#59665f]">
              Die Anwendung speichert Dialoge, trennt allgemeines und objektbezogenes
              Wissen, arbeitet mit sicheren Gästelinks und ist für den Betrieb auf
              Vercel vorbereitet.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div
                className="rounded-lg border border-[#d8d8ce] bg-[#fffefa] px-4 py-4 text-sm font-semibold text-[#203029]"
                key={module}
              >
                {module}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1d2d27] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f0c85a]">
              Demo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">
              Testen Sie, wie der KI-Concierge im echten Gästeinterface antwortet.
            </h2>
          </div>
          <Link
            className="inline-flex w-fit rounded-md bg-white px-5 py-3 text-sm font-bold text-[#1d2d27] transition hover:bg-[#f1efe4]"
            href="/chat"
          >
            Chat starten
          </Link>
        </div>
      </section>
    </main>
  );
}
