export type LiveFacilityStatus = "open" | "closed" | "unknown";

export type LiveFacilityItem = {
  category: string;
  area: string | null;
  name: string;
  status: LiveFacilityStatus;
  type: string | null;
  href: string | null;
};

export type LiveFacilityCategory = {
  category: string;
  countText: string | null;
  openCount: number | null;
  totalCount: number | null;
  items: LiveFacilityItem[];
};

export type LiveFacilities = {
  source: string;
  sourceUrl: string;
  checkedAt: string;
  reportedAt: string | null;
  categories: LiveFacilityCategory[];
};

const OPEN_FACILITIES_URL = "https://www.saas-fee.ch/en/open-lifts/all";

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&auml;/g, "ä")
    .replace(/&Auml;/g, "Ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&hellip;/g, "…")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function cleanHtmlText(value: string | undefined) {
  return decodeHtml(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1];
}

function parseCount(countText: string | null) {
  if (!countText) {
    return { openCount: null, totalCount: null };
  }

  const match = countText.match(/(\d+)\s+of\s+(\d+)/i);

  return {
    openCount: match ? Number(match[1]) : null,
    totalCount: match ? Number(match[2]) : null,
  };
}

function normalizeStatus(status: string | null): LiveFacilityStatus {
  const normalized = status?.toLowerCase();

  if (normalized === "open") {
    return "open";
  }

  if (normalized === "closed") {
    return "closed";
  }

  return "unknown";
}

function absoluteSaasFeeUrl(href: string | null) {
  if (!href) {
    return null;
  }

  try {
    return new URL(decodeHtml(href), OPEN_FACILITIES_URL).toString();
  } catch {
    return null;
  }
}

export function parseSaasFeeOpenFacilitiesHtml(html: string): LiveFacilities {
  const reportedAt = cleanHtmlText(
    getMatch(html, /<div class="d-none" hidden="hidden">([\s\S]*?)<\/div>/i)
  );
  const cardMatches = [...html.matchAll(/<div id="([^"]+)" class="card">/g)];
  const categories: LiveFacilityCategory[] = [];

  cardMatches.forEach((cardMatch, cardIndex) => {
    const start = cardMatch.index ?? 0;
    const end = cardMatches[cardIndex + 1]?.index ?? html.length;
    const section = html.slice(start, end);
    const category = cleanHtmlText(
      getMatch(section, /<h6 class="__heading">\s*([\s\S]*?)\s*<\/h6>/i)
    );

    if (!category) {
      return;
    }

    const countText = cleanHtmlText(
      getMatch(section, /<div class="__open-lifts[^"]*">\s*([\s\S]*?)\s*<\/div>/i)
    );
    const { openCount, totalCount } = parseCount(countText || null);
    const bodyMatches = [
      ...section.matchAll(/<div data-type="([^"]+)" class="card-body[^"]*"/g),
    ];
    const items: LiveFacilityItem[] = [];
    let area: string | null = null;

    bodyMatches.forEach((bodyMatch, bodyIndex) => {
      const bodyStart = bodyMatch.index ?? 0;
      const bodyEnd = bodyMatches[bodyIndex + 1]?.index ?? section.length;
      const body = section.slice(bodyStart, bodyEnd);
      const type = bodyMatch[1] ?? null;

      if (type?.endsWith("-region")) {
        const regionName = cleanHtmlText(
          getMatch(body, /<h6[^>]*>\s*([\s\S]*?)\s*<\/h6>/i)
        );
        area = regionName || area;
        return;
      }

      const name = cleanHtmlText(
        getMatch(body, /<h6 class="header"[^>]*>\s*([\s\S]*?)\s*<\/h6>/i)
      );

      if (!name) {
        return;
      }

      const statusText = cleanHtmlText(
        getMatch(body, /<div class="status-text"[^>]*>\s*([\s\S]*?)\s*<\/div>/i)
      );
      const href = getMatch(body, /<a[^>]+href="([^"]+)"/i);

      items.push({
        category,
        area,
        name,
        status: normalizeStatus(statusText || null),
        type,
        href: absoluteSaasFeeUrl(href ?? null),
      });
    });

    categories.push({
      category,
      countText: countText || null,
      openCount,
      totalCount,
      items,
    });
  });

  return {
    source: "Saas-Fee/Saastal official open facilities page",
    sourceUrl: OPEN_FACILITIES_URL,
    checkedAt: new Date().toISOString(),
    reportedAt: reportedAt || null,
    categories,
  };
}

export async function getLiveSaasFeeOpenFacilities(): Promise<LiveFacilities | null> {
  try {
    const response = await fetch(OPEN_FACILITIES_URL, {
      headers: {
        "user-agent": "Mozilla/5.0 Saas-Fee AI Concierge",
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Saas-Fee open facilities page returned ${response.status}`);
    }

    const html = await response.text();
    const facilities = parseSaasFeeOpenFacilitiesHtml(html);

    if (!facilities.categories.length) {
      throw new Error("No facility categories found in the source page");
    }

    return facilities;
  } catch (error) {
    console.error(
      `Could not load Saas-Fee open facilities: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return null;
  }
}
