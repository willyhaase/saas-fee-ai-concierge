"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TopEntry = {
  name: string;
  count: number;
};

type RecentQuestion = {
  question: string | null;
  category: string | null;
  intent: string | null;
  createdAt: string | null;
};

type PropertyOption = {
  id: string;
  slug: string | null;
  name: string | null;
  address: string | null;
  count?: number;
};

type StatsResponse = {
  total: number;
  range: {
    days: number;
    from: string;
    to: string;
  };
  property: PropertyOption | null;
  properties: PropertyOption[];
  categories: TopEntry[];
  intents: TopEntry[];
  topEntities: TopEntry[];
  restaurants: {
    total: number;
    topRestaurants: TopEntry[];
    topIntents: TopEntry[];
    recentQuestions: RecentQuestion[];
  };
  activities: {
    total: number;
    topActivities: TopEntry[];
    topIntents: TopEntry[];
    recentQuestions: RecentQuestion[];
  };
  otherQuestions: {
    total: number;
    topCategories: TopEntry[];
    recentQuestions: RecentQuestion[];
  };
  recentQuestions: RecentQuestion[];
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatList({
  title,
  items,
}: {
  title: string;
  items: TopEntry[];
}) {
  return (
    <section className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-[#151815]">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-[#ecece3] pb-2 last:border-0 last:pb-0"
              key={item.name}
            >
              <span className="break-words text-sm text-[#28302a]">
                {item.name}
              </span>
              <span className="rounded-md bg-[#eef3ed] px-2 py-1 text-sm font-semibold text-[#1f5f46]">
                {item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#667268]">Noch keine Daten.</p>
        )}
      </div>
    </section>
  );
}

function QuestionsList({
  title,
  questions,
}: {
  title: string;
  questions: RecentQuestion[];
}) {
  return (
    <section className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-[#151815]">{title}</h2>
      <div className="mt-4 space-y-3">
        {questions.length ? (
          questions.map((item, index) => (
            <div
              className="border-b border-[#ecece3] pb-3 last:border-0 last:pb-0"
              key={`${item.createdAt}-${index}`}
            >
              <p className="text-sm leading-6 text-[#28302a]">
                {item.question}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6b746d]">
                {item.category} / {item.intent} {formatDate(item.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#667268]">Noch keine Fragen.</p>
        )}
      </div>
    </section>
  );
}

function PropertyList({
  properties,
  token,
  days,
}: {
  properties: PropertyOption[];
  token: string;
  days: number;
}) {
  const visibleProperties = properties.filter((property) => property.slug);

  if (!visibleProperties.length) {
    return null;
  }

  return (
    <section className="mt-5 rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#151815]">
            Statistik nach Unterkunft
          </h2>
          <p className="mt-1 text-sm text-[#667268]">
            Oeffnen Sie eine Unterkunftsseite, damit Eigentuemer nur die
            Fragen ihrer eigenen Gaeste sehen.
          </p>
        </div>
        <span className="text-sm text-[#667268]">
          {visibleProperties.length} Unterkuenfte
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProperties.map((property) => {
          const params = new URLSearchParams({ days: String(days) });

          if (token) {
            params.set("token", token);
          }

          return (
            <Link
              className="rounded-md border border-[#ecece3] bg-[#fbfbf7] p-3 transition hover:border-[#9cb4a5] hover:bg-white"
              href={`/stats/properties/${property.slug}?${params}`}
              key={property.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#151815]">
                    {property.name ?? property.slug}
                  </p>
                  {property.address ? (
                    <p className="mt-1 text-xs text-[#667268]">
                      {property.address}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-md bg-[#eef3ed] px-2 py-1 text-sm font-semibold text-[#1f5f46]">
                  {property.count ?? 0}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function StatsDashboard({
  propertySlug,
}: {
  propertySlug?: string;
}) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("token") ?? "";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      days: String(days),
    });

    if (token) {
      params.set("token", token);
    }

    if (propertySlug) {
      params.set("propertySlug", propertySlug);
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/stats?${params}`)
      .then(async (response) => {
        const data = (await response.json()) as StatsResponse;

        if (!response.ok || data.error) {
          throw new Error(data.error || "Could not load stats.");
        }

        setStats(data);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load stats."
        );
      })
      .finally(() => setIsLoading(false));
  }, [days, propertySlug, token]);

  const pageTitle = stats?.property
    ? `Statistik: ${stats.property.name ?? stats.property.slug}`
    : "Gaesteanfragen-Statistik";
  const pageDescription = stats?.property
    ? "Was Gaeste dieser Unterkunft suchen, fragen und interessant finden."
    : "Restaurants, Aktivitaeten, Themen und aktuelle Gaestefragen.";

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#1f2421]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="border-b border-[#d8d8ce] pb-5">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#5b6b5f]">
            Saas-Fee Concierge
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#151815]">
                {pageTitle}
              </h1>
              <p className="mt-2 text-sm text-[#5b6b5f]">
                {pageDescription}
              </p>
              {stats?.property?.address ? (
                <p className="mt-1 text-sm text-[#667268]">
                  {stats.property.address}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              {propertySlug ? (
                <Link
                  className="text-sm font-medium text-[#1f5f46] underline-offset-4 hover:underline"
                  href={token ? `/stats?token=${token}` : "/stats"}
                >
                  Alle Unterkuenfte
                </Link>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-[#4f5b52]">
                Zeitraum
                <select
                  className="h-10 rounded-md border border-[#c8c8bc] bg-white px-3 outline-none focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  onChange={(event) => setDays(Number(event.target.value))}
                  value={days}
                >
                  <option value={7}>7</option>
                  <option value={30}>30</option>
                  <option value={90}>90</option>
                  <option value={365}>365</option>
                </select>
              </label>
            </div>
          </div>
        </header>

        {error ? (
          <p className="mt-5 rounded-md border border-[#d56f5b] bg-[#fff5f2] px-3 py-2 text-sm text-[#8c2f20]">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-5 text-sm text-[#5b6b5f]">
            Statistik wird geladen...
          </p>
        ) : null}

        {stats ? (
          <div className="py-5">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#5b6b5f]">Anfragen gesamt</p>
                <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#5b6b5f]">Restaurants</p>
                <p className="mt-2 text-3xl font-semibold">
                  {stats.restaurants.total}
                </p>
              </div>
              <div className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#5b6b5f]">Aktivitaeten</p>
                <p className="mt-2 text-3xl font-semibold">
                  {stats.activities.total}
                </p>
              </div>
              <div className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#5b6b5f]">Andere Fragen</p>
                <p className="mt-2 text-3xl font-semibold">
                  {stats.otherQuestions.total}
                </p>
              </div>
            </section>

            {!propertySlug ? (
              <PropertyList
                days={days}
                properties={stats.properties}
                token={token}
              />
            ) : null}

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <StatList
                items={stats.restaurants.topRestaurants}
                title="Interessante Restaurants"
              />
              <StatList
                items={stats.activities.topActivities}
                title="Interessante Aktivitaeten"
              />
              <StatList items={stats.categories} title="Fragekategorien" />
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <StatList
                items={stats.restaurants.topIntents}
                title="Worum es bei Restaurants ging"
              />
              <StatList
                items={stats.activities.topIntents}
                title="Worum es bei Aktivitaeten ging"
              />
              <StatList
                items={stats.otherQuestions.topCategories}
                title="Weitere Themen"
              />
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <QuestionsList
                questions={stats.restaurants.recentQuestions}
                title="Aktuelle Restaurantfragen"
              />
              <QuestionsList
                questions={stats.activities.recentQuestions}
                title="Aktuelle Aktivitaetsfragen"
              />
              <QuestionsList
                questions={stats.otherQuestions.recentQuestions}
                title="Aktuelle weitere Fragen"
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
