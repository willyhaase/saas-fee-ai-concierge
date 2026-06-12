import fs from "node:fs";

const envFile = ".env.local";

if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;

    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

const config = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0",
  appAccessToken:
    process.env.META_APP_ACCESS_TOKEN ||
    (process.env.META_APP_ID && process.env.META_APP_SECRET
      ? `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
      : null),
};

function mask(value) {
  if (!value) return "missing";
  return `set (...${value.slice(-4)})`;
}

async function graphGet(path, accessToken = config.accessToken) {
  const url = new URL(
    `https://graph.facebook.com/${config.graphApiVersion}/${path}`
  );
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const json = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, json };
}

function printError(label, result) {
  const error = result.json?.error;
  console.log(`FAIL ${label}`);
  console.log(`   HTTP: ${result.status}`);
  console.log(`   code: ${error?.code ?? "unknown"}`);
  console.log(`   subcode: ${error?.error_subcode ?? "none"}`);
  console.log(`   message: ${error?.message ?? JSON.stringify(result.json)}`);
}

console.log("WhatsApp Business Platform diagnostics");
console.log("--------------------------------------");
console.log(`WHATSAPP_ACCESS_TOKEN: ${mask(config.accessToken)}`);
console.log(`WHATSAPP_PHONE_NUMBER_ID: ${mask(config.phoneNumberId)}`);
console.log(`WHATSAPP_GRAPH_API_VERSION: ${config.graphApiVersion}`);
console.log(`META_APP_ACCESS_TOKEN / META_APP_ID+SECRET: ${mask(config.appAccessToken)}`);

if (!config.accessToken || !config.phoneNumberId) {
  console.log("");
  console.log(
    "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID. Set them in .env.local or Vercel env vars first."
  );
  process.exit(1);
}

console.log("");
console.log("1. Checking whether the token can read the phone number ID...");
const phone = await graphGet(
  `${config.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,whatsapp_business_account`
);

if (phone.ok) {
  const waba = phone.json.whatsapp_business_account;
  console.log("OK Phone number is visible to this token");
  console.log(`   phone_number_id: ${phone.json.id}`);
  console.log(`   display_phone_number: ${phone.json.display_phone_number ?? "unknown"}`);
  console.log(`   verified_name: ${phone.json.verified_name ?? "unknown"}`);
  console.log(`   WABA id: ${waba?.id ?? "unknown"}`);
} else {
  printError("Token cannot read WHATSAPP_PHONE_NUMBER_ID", phone);
  console.log("");
  console.log("Most likely causes:");
  console.log("- WHATSAPP_PHONE_NUMBER_ID is actually a WABA ID, Business ID, or app ID.");
  console.log("- The system user token was generated for a different Business/App.");
  console.log("- The system user has not been assigned this WhatsApp Business Account.");
  console.log("- The token is missing whatsapp_business_messaging permission.");
}

console.log("");
console.log("2. Checking basic token identity...");
const me = await graphGet("me?fields=id,name");
if (me.ok) {
  console.log("OK Token is accepted by Graph API");
  console.log(`   id: ${me.json.id ?? "unknown"}`);
  console.log(`   name: ${me.json.name ?? "unknown"}`);
} else {
  printError("Token is not accepted by Graph API", me);
}

console.log("");
console.log("3. Checking token permissions/scopes...");
if (config.appAccessToken) {
  const debugUrl = new URL(
    `https://graph.facebook.com/${config.graphApiVersion}/debug_token`
  );
  debugUrl.searchParams.set("input_token", config.accessToken);
  debugUrl.searchParams.set("access_token", config.appAccessToken);

  const response = await fetch(debugUrl);
  const debug = await response.json().catch(() => ({}));

  if (response.ok && debug.data) {
    const scopes = debug.data.scopes ?? [];
    const granularScopes = debug.data.granular_scopes ?? [];
    console.log("OK Token debug data loaded");
    console.log(`   app_id: ${debug.data.app_id ?? "unknown"}`);
    console.log(`   type: ${debug.data.type ?? "unknown"}`);
    console.log(`   is_valid: ${debug.data.is_valid}`);
    console.log(`   expires_at: ${debug.data.expires_at || "never/unknown"}`);
    console.log(`   scopes: ${scopes.length ? scopes.join(", ") : "none"}`);
    if (granularScopes.length) {
      console.log(
        `   granular scopes: ${granularScopes
          .map((scope) => scope.scope)
          .filter(Boolean)
          .join(", ")}`
      );
    }

    const hasMessaging =
      scopes.includes("whatsapp_business_messaging") ||
      granularScopes.some(
        (scope) => scope.scope === "whatsapp_business_messaging"
      );
    console.log(
      hasMessaging
        ? "OK whatsapp_business_messaging is present"
        : "FAIL whatsapp_business_messaging is missing"
    );
  } else {
    console.log("FAIL Could not debug token");
    console.log(`   HTTP: ${response.status}`);
    console.log(`   message: ${debug.error?.message ?? JSON.stringify(debug)}`);
  }
} else {
  console.log(
    "Skipped. Set META_APP_ACCESS_TOKEN or META_APP_ID + META_APP_SECRET to inspect scopes."
  );
}

console.log("");
console.log("Diagnosis summary:");
console.log(
  "If step 1 fails with (#200), fix Business Manager permissions or WHATSAPP_PHONE_NUMBER_ID before changing app code."
);
console.log(
  "If step 1 passes but sending fails, check approved template name/language and the recipient messaging rules."
);
