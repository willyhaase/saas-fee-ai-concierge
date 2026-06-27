import Image from "next/image";
import Link from "next/link";
import FeedbackForm from "./feedback-form";
import HtmlLang from "./html-lang";
import {
  getLandingCopy,
  landingCopies,
  landingLocales,
  type LandingLocale,
} from "./landing-copy";

type LandingPageProps = {
  locale: LandingLocale;
};

function createSectionHref(locale: LandingLocale, section: string) {
  const path = landingCopies[locale].path;

  return `${path === "/" ? "" : path}#${section}`;
}

export default function LandingPage({ locale }: LandingPageProps) {
  const copy = getLandingCopy(locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Saas-Fee AI Concierge",
    alternateName: "AI Concierge for Saas-Fee",
    url: "https://saas-fee-concierge.ch",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    description: copy.metadata.description,
    areaServed: {
      "@type": "Place",
      name: copy.structuredDataPlace,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Guests and visitors in Saas-Fee",
    },
    isAccessibleForFree: true,
    offers: {
      "@type": "AggregateOffer",
      availability: "https://schema.org/InStock",
      priceCurrency: "CHF",
      lowPrice: "69",
      highPrice: "590",
      offerCount: "3",
    },
  };

  return (
    <main className="min-h-screen bg-[var(--wil-paper)] text-[var(--wil-ink)]">
      <HtmlLang lang={copy.lang} />
      <section className="relative flex min-h-screen overflow-hidden sm:min-h-[92vh]">
        <Image
          src="/story/saas-fee-story-bg-clean.png"
          alt={copy.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#211E18]/62" />
        <div className="absolute inset-x-0 bottom-0 hidden h-36 bg-[var(--wil-paper)] sm:block" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col items-start justify-between gap-4 text-white sm:flex-row sm:items-center">
            <Link
              aria-label="Saas-Fee AI Concierge"
              className="flex shrink-0 items-center transition hover:opacity-90"
              href={copy.path}
            >
              <Image
                src="/saas-fee-logo.png"
                alt="Saas-Fee AI Concierge"
                width={160}
                height={160}
                className="h-16 w-16 drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] sm:h-32 sm:w-32 lg:h-36 lg:w-36"
                priority
              />
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                className="rounded-md px-3 py-2 font-medium text-[#F6F1E8]/82 transition hover:bg-[#F6F1E8]/12 hover:text-[#F6F1E8]"
                href={createSectionHref(locale, "product")}
              >
                {copy.nav.product}
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-[#F6F1E8]/82 transition hover:bg-[#F6F1E8]/12 hover:text-[#F6F1E8]"
                href={createSectionHref(locale, "architecture")}
              >
                {copy.nav.modules}
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-[#F6F1E8]/82 transition hover:bg-[#F6F1E8]/12 hover:text-[#F6F1E8]"
                href={createSectionHref(locale, "preise")}
              >
                {copy.nav.pricing}
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-[#F6F1E8]/82 transition hover:bg-[#F6F1E8]/12 hover:text-[#F6F1E8]"
                href={createSectionHref(locale, "kontakt")}
              >
                {copy.nav.contact}
              </a>
              <div className="flex rounded-md border border-[#F6F1E8]/25 p-1">
                {landingLocales.map((item) => {
                  const language = landingCopies[item];

                  return (
                    <Link
                      aria-current={item === locale ? "page" : undefined}
                      className={`flex min-h-10 min-w-11 items-center justify-center rounded px-2 py-1 text-xs font-bold transition ${
                        item === locale
                          ? "bg-[#F6F1E8] text-[#211E18]"
                          : "text-[#F6F1E8]/76 hover:bg-[#F6F1E8]/12 hover:text-[#F6F1E8]"
                      }`}
                      href={language.path}
                      hrefLang={language.lang}
                      key={item}
                    >
                      {language.label}
                    </Link>
                  );
                })}
              </div>
              <Link
                className="rounded-md bg-[#DC6B43] px-4 py-2 font-semibold text-[#211E18] transition hover:bg-[#E89B6F]"
                href="/chat"
              >
                {copy.nav.chat}
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-8 pb-6 pt-6 md:gap-10 md:pb-20 md:pt-10 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:pb-28 lg:pt-4">
            <div className="max-w-5xl text-white lg:-translate-y-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#E89B6F] sm:mb-5 sm:tracking-[0.24em]">
                {copy.hero.eyebrow}
              </p>
              <h1 className="font-accent max-w-5xl text-balance text-3xl font-bold leading-[1.05] tracking-normal text-[#F6F1E8] sm:text-5xl lg:text-6xl">
                {copy.hero.title}
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-[#F6F1E8]/86 sm:mt-6 sm:text-lg sm:leading-8">
                {copy.hero.description}
              </p>
              <p className="font-accent mt-3 hidden max-w-2xl text-lg leading-7 text-[#E89B6F] sm:block">
                {copy.hero.audience}
              </p>
              <div className="mt-5 flex flex-row flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-md bg-[#DC6B43] px-5 py-3 text-sm font-semibold text-[#211E18] transition hover:bg-[#E89B6F]"
                  href="/chat"
                >
                  {copy.hero.guestCta}
                </Link>
                <a
                  className="inline-flex items-center justify-center rounded-md border border-[#F6F1E8]/45 px-5 py-3 text-sm font-semibold text-[#F6F1E8] transition hover:border-[#F6F1E8] hover:bg-[#F6F1E8]/12"
                  href={createSectionHref(locale, "kontakt")}
                >
                  {copy.hero.ownerCta}
                </a>
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-[#F6F1E8]/18 shadow-2xl shadow-black/30 md:block">
              {/* Chat header */}
              <div className="flex items-center gap-3 bg-[#2E4A3A] px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2E4A3A] text-sm font-bold text-[#F6F1E8]">
                  W
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F6F1E8]">Wil Concierge</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E89B6F]" />
                    <span className="text-xs text-[#F6F1E8]/68">Online · antwortet sofort</span>
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="flex flex-col gap-3 bg-[#F6F1E8] px-4 py-4">
                {/* Guest */}
                <div className="flex justify-start">
                  <p className="max-w-[220px] rounded-lg border border-[#211E18]/12 bg-[#FCFAF4] px-3 py-2 text-sm leading-relaxed text-[#211E18]">
                    Welche Restaurants empfehlen Sie heute?
                  </p>
                </div>
                {/* AI */}
                <div className="flex justify-end">
                  <p className="max-w-[240px] rounded-lg bg-[#2E4A3A] px-3 py-2 text-sm leading-relaxed text-[#F6F1E8]">
                    Guten Tag! Ich empfehle das{" "}
                    <strong>Hannig</strong> — sonniger Berglunch ab{" "}
                    <strong>CHF 35</strong>. Tisch reservieren?
                  </p>
                </div>
                {/* Guest 2 */}
                <div className="flex justify-start">
                  <p className="max-w-[200px] rounded-lg border border-[#211E18]/12 bg-[#FCFAF4] px-3 py-2 text-sm leading-relaxed text-[#211E18]">
                    Ja bitte, 2 Personen um 13:00!
                  </p>
                </div>
                {/* AI 2 */}
                <div className="flex justify-end">
                  <div className="max-w-[240px] rounded-lg bg-[#2E4A3A] px-3 py-2 text-sm text-[#F6F1E8]">
                    <p className="leading-relaxed">Reservierung wird gesendet ✓</p>
                    <p className="mt-0.5 text-xs text-[#F6F1E8]/70">Hannig · 13:00 · 2 Personen</p>
                  </div>
                </div>
              </div>
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 border-t border-[#211E18]/10 bg-[#FCFAF4] px-4 py-3">
                {["Restaurants", "Bergbahnen", "Wetter"].map((label) => (
                  <span
                    key={label}
                    className="rounded-md border border-[#2E4A3A]/18 bg-[#F6F1E8] px-3 py-1.5 text-xs font-semibold text-[#2E4A3A]"
                  >
                    {label}
                  </span>
                ))}
              </div>
              {/* Input */}
              <div className="flex items-center gap-2 border-t border-[#211E18]/10 bg-[#FCFAF4] px-4 py-3">
                <div className="flex-1 rounded-md border border-[#211E18]/16 bg-[#F6F1E8] px-3 py-2 text-sm text-[#5C5648]">
                  Ihre Nachricht...
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#DC6B43] text-base text-[#211E18]">
                  →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="product"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#DC6B43]">
              {copy.product.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal text-[#211E18] sm:text-4xl">
              {copy.product.title}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.product.features.map((feature) => (
              <article
                className="rounded-lg border border-[#211E18]/12 bg-[#FCFAF4] p-5 shadow-sm shadow-[#211E18]/5"
                key={feature.title}
              >
                <h3 className="text-lg font-semibold text-[#211E18]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5C5648]">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FCFAF4] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#DC6B43]">
              {copy.useCases.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal sm:text-4xl">
              {copy.useCases.title}
            </h2>
          </div>
          <ol className="space-y-3">
            {copy.useCases.items.map((item, index) => (
              <li
                className="flex gap-4 rounded-lg border border-[#211E18]/12 bg-[#F6F1E8] p-4"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#2E4A3A] text-sm font-semibold text-[#F6F1E8]">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-[#5C5648]">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="architecture"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#DC6B43]">
              {copy.architecture.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal sm:text-4xl">
              {copy.architecture.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5C5648]">
              {copy.architecture.text}
            </p>
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.architecture.modules.map((module) => (
                <div
                  className="rounded-lg border border-[#211E18]/12 bg-[#FCFAF4] px-4 py-4 text-sm font-semibold text-[#211E18]"
                  key={module}
                >
                  {module}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C5648]">
                {copy.architecture.techLabel}
              </span>
              {copy.architecture.techStack.map((item) => (
                <span
                  className="rounded-md border border-[#211E18]/12 bg-[#FCFAF4] px-3 py-1 text-xs font-semibold text-[#5C5648]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="preise" className="bg-[#FCFAF4] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#DC6B43]">
                {copy.pricing.eyebrow}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal sm:text-4xl">
                {copy.pricing.title}
              </h2>
            </div>
            <p className="text-base leading-7 text-[#5C5648]">
              {copy.pricing.text}
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {copy.pricing.plans.map((plan) => (
              <article
                className={`rounded-lg border p-5 shadow-sm ${
                  plan.featured
                    ? "border-[#DC6B43] bg-[#F6F1E8]"
                    : "border-[#211E18]/12 bg-[#FCFAF4]"
                }`}
                key={plan.name}
              >
                <h3 className="text-xl font-semibold text-[#211E18]">
                  {plan.name}
                </h3>
                <p className="mt-4 text-3xl font-bold tracking-normal text-[#2E4A3A]">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#C2552F]">
                  {plan.annual}
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5C5648]">
                  {plan.features.map((feature) => (
                    <li className="flex gap-2" key={feature}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC6B43]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-[#211E18]/12 pt-4 text-sm leading-6 text-[#5C5648]">
                  {plan.note}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-[#211E18]/12 bg-[#F6F1E8] p-5 sm:p-6">
            <p className="font-semibold text-[#211E18]">
              {copy.pricing.launchTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5C5648]">
              {copy.pricing.launchText}
            </p>
          </div>
        </div>
      </section>

      <section id="kontakt" className="bg-[#F6F1E8] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#DC6B43]">
              {copy.contact.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal sm:text-4xl">
              {copy.contact.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5C5648]">
              {copy.contact.text}
            </p>
          </div>
          <div className="rounded-lg border border-[#211E18]/12 bg-[#FCFAF4] p-5 shadow-sm shadow-[#211E18]/5 sm:p-6">
            <FeedbackForm copy={copy.form} />
          </div>
        </div>
      </section>

      <section className="bg-[#211E18] px-5 py-16 text-[#F6F1E8] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#E89B6F]">
              {copy.demo.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-normal">
              {copy.demo.title}
            </h2>
          </div>
          <Link
            className="inline-flex w-fit rounded-md bg-[#DC6B43] px-5 py-3 text-sm font-bold text-[#211E18] transition hover:bg-[#E89B6F]"
            href="/chat"
          >
            {copy.demo.cta}
          </Link>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
