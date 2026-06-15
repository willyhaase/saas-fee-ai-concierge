import { NextResponse } from "next/server";

type FeedbackRequest = {
  firstname?: unknown;
  lastname?: unknown;
  email?: unknown;
  company?: unknown;
  phone?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
  hutk?: unknown;
  pageUri?: unknown;
  pageName?: unknown;
};

type HubSpotField = {
  name: string;
  value: string;
};

export const runtime = "nodejs";

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getRequiredHubSpotConfig() {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FEEDBACK_FORM_ID;

  if (!portalId || !formId) {
    return null;
  }

  return { portalId, formId };
}

function createField(name: string, value: string | null) {
  return value ? { name, value } : null;
}

export async function POST(request: Request) {
  let payload: FeedbackRequest;

  try {
    payload = (await request.json()) as FeedbackRequest;
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  if (getString(payload.website)) {
    return NextResponse.json({ success: true });
  }

  const firstname = getString(payload.firstname);
  const lastname = getString(payload.lastname);
  const email = getString(payload.email);
  const company = getString(payload.company);
  const phone = getString(payload.phone);
  const message = getString(payload.message);
  const hutk = getString(payload.hutk);
  const pageUri = getString(payload.pageUri);
  const pageName = getString(payload.pageName);
  const consent = payload.consent === true;

  if (!firstname || !email || !message || !consent) {
    return NextResponse.json(
      { error: "Bitte füllen Sie alle Pflichtfelder aus." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const config = getRequiredHubSpotConfig();

  if (!config) {
    return NextResponse.json(
      {
        error:
          "HubSpot ist noch nicht konfiguriert. Bitte HUBSPOT_PORTAL_ID und HUBSPOT_FEEDBACK_FORM_ID setzen.",
      },
      { status: 503 }
    );
  }

  const messageFieldName =
    process.env.HUBSPOT_FEEDBACK_MESSAGE_FIELD || "message";
  const sourceFieldName = process.env.HUBSPOT_FEEDBACK_SOURCE_FIELD;

  const fields: HubSpotField[] = [
    createField("firstname", firstname),
    createField("lastname", lastname),
    createField("email", email),
    createField("company", company),
    createField("phone", phone),
    createField(messageFieldName, message),
    sourceFieldName
      ? createField(sourceFieldName, "Saas-Fee AI Concierge Landingpage")
      : null,
  ].filter((field): field is HubSpotField => Boolean(field));

  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${config.portalId}/${config.formId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields,
        context: {
          hutk: hutk || undefined,
          pageUri: pageUri || undefined,
          pageName: pageName || "Saas-Fee AI Concierge",
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: "Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage in HubSpot gespeichert und verwendet werden.",
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    console.error("HubSpot feedback submission failed:", responseText);

    return NextResponse.json(
      { error: "HubSpot konnte die Anfrage nicht speichern." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
