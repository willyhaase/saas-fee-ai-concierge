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
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: copy.metadata.description,
    areaServed: {
      "@type": "Place",
      name: copy.structuredDataPlace,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "CHF",
    },
  };

  return (
    <main className="min-h-screen bg-[#f5f4ed] text-[#18211d]">
      <HtmlLang lang={copy.lang} />
      <section className="relative flex min-h-[92vh] overflow-hidden">
        <Image
          src="/story/saas-fee-story-bg-clean.png"
          alt={copy.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0f1b17]/58" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[#f5f4ed]" />

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
                className="h-28 w-28 drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] sm:h-32 sm:w-32 lg:h-36 lg:w-36"
                priority
              />
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                className="rounded-md px-3 py-2 font-medium text-white/82 transition hover:bg-white/12 hover:text-white"
                href={createSectionHref(locale, "product")}
              >
                {copy.nav.product}
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-white/82 transition hover:bg-white/12 hover:text-white"
                href={createSectionHref(locale, "architecture")}
              >
                {copy.nav.modules}
              </a>
              <a
                className="rounded-md px-3 py-2 font-medium text-white/82 transition hover:bg-white/12 hover:text-white"
                href={createSectionHref(locale, "kontakt")}
              >
                {copy.nav.contact}
              </a>
              <div className="flex rounded-md border border-white/25 p-1">
                {landingLocales.map((item) => {
                  const language = landingCopies[item];

                  return (
                    <Link
                      aria-current={item === locale ? "page" : undefined}
                      className={`rounded px-2 py-1 text-xs font-bold transition ${
                        item === locale
                          ? "bg-white text-[#17362b]"
                          : "text-white/76 hover:bg-white/12 hover:text-white"
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
                className="rounded-md bg-white px-4 py-2 font-semibold text-[#17362b] transition hover:bg-[#eef1e8]"
                href="/chat"
              >
                {copy.nav.chat}
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 pb-24 pt-10 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:pb-28 lg:pt-4">
            <div className="max-w-5xl text-white lg:-translate-y-6">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#d7e8d9]">
                {copy.hero.eyebrow}
              </p>
              <h1 className="max-w-5xl text-balance text-4xl font-semibold leading-[1.05] tracking-normal sm:text-5xl lg:text-6xl">
                {copy.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/86">
                {copy.hero.description}
              </p>
            </div>

            <div className="rounded-lg border border-white/22 bg-white/92 p-5 text-[#18211d] shadow-2xl shadow-black/20 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3e6d5a]">
                {copy.metrics.eyebrow}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                {copy.metrics.items.map((item) => (
                  <div key={`${item.value}-${item.label}`}>
                    <dt
                      className={`font-semibold ${
                        item.value.length > 4 ? "text-2xl" : "text-3xl"
                      }`}
                    >
                      {item.value}
                    </dt>
                    <dd className="mt-1 text-sm text-[#53615a]">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3e6d5a]">
              {copy.product.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-normal text-[#15221d]">
              {copy.product.title}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.product.features.map((feature) => (
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
              {copy.useCases.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-normal">
              {copy.useCases.title}
            </h2>
          </div>
          <ol className="space-y-3">
            {copy.useCases.items.map((item, index) => (
              <li
                className="flex gap-4 rounded-lg border border-[#e2e0d4] bg-[#fbfaf5] p-4"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#244d40] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-[#3f4b45]">
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#315f7d]">
              {copy.architecture.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-normal">
              {copy.architecture.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#59665f]">
              {copy.architecture.text}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.architecture.modules.map((module) => (
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

      <section id="kontakt" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3e6d5a]">
              {copy.contact.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-normal">
              {copy.contact.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#59665f]">
              {copy.contact.text}
            </p>
          </div>
          <div className="rounded-lg border border-[#d8d8ce] bg-[#fbfaf5] p-5 shadow-sm sm:p-6">
            <FeedbackForm copy={copy.form} />
          </div>
        </div>
      </section>

      <section className="bg-[#1d2d27] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f0c85a]">
              {copy.demo.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-normal">
              {copy.demo.title}
            </h2>
          </div>
          <Link
            className="inline-flex w-fit rounded-md bg-white px-5 py-3 text-sm font-bold text-[#1d2d27] transition hover:bg-[#f1efe4]"
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
