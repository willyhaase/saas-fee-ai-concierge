#!/usr/bin/env npx tsx
/**
 * Backfill embeddings for global_knowledge, property_faq, property_instructions.
 *
 * Usage:
 *   npx tsx scripts/backfill-embeddings.ts
 *
 * Optional env overrides:
 *   BACKFILL_BATCH_SIZE=20   (records per batch, default 20)
 *   BACKFILL_DELAY_MS=150    (ms between OpenAI calls, default 150)
 *   BACKFILL_DRY_RUN=true    (print records without writing embeddings)
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local then .env
for (const file of [".env.local", ".env"]) {
  const p = path.resolve(process.cwd(), file);
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`Loaded ${file}`);
    break;
  }
}

const BATCH_SIZE = parseInt(process.env.BACKFILL_BATCH_SIZE ?? "20", 10);
const DELAY_MS   = parseInt(process.env.BACKFILL_DELAY_MS   ?? "150", 10);
const DRY_RUN    = process.env.BACKFILL_DRY_RUN === "true";

function getEnv(name: string, fallback?: string) {
  return process.env[name] ?? fallback;
}

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) { console.error(`Missing env var: ${name}`); process.exit(1); }
  return v;
}

const openai = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

const supabase = createClient(
  getEnv("SUPABASE_URL") ?? requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    getEnv("SUPABASE_SERVICE_KEY") ??
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function embed(text: string): Promise<number[]> {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " ").slice(0, 8000),
  });
  return r.data[0].embedding;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type TableConfig = {
  table: string;
  textFn: (row: Record<string, unknown>) => string;
  label: (row: Record<string, unknown>) => string;
  select: string;
};

const TABLES: TableConfig[] = [
  {
    table: "global_knowledge",
    select: "id, title, content",
    textFn: (r) => `${r.title ?? ""}\n${r.content ?? ""}`.trim(),
    label: (r) => String(r.title ?? r.id),
  },
  {
    table: "property_faq",
    select: "id, question, answer",
    textFn: (r) => `Q: ${r.question ?? ""}\nA: ${r.answer ?? ""}`.trim(),
    label: (r) => String(r.question ?? r.id).slice(0, 60),
  },
  {
    table: "property_instructions",
    select: "id, title, content",
    textFn: (r) => `${r.title ?? ""}\n${r.content ?? ""}`.trim(),
    label: (r) => String(r.title ?? r.id).slice(0, 60),
  },
];

async function backfillTable(cfg: TableConfig) {
  console.log(`\n── ${cfg.table} ──`);

  // Count total without embedding
  const { count } = await supabase
    .from(cfg.table)
    .select("id", { count: "exact", head: true })
    .is("embedding", null);

  console.log(`  Records without embedding: ${count ?? "?"}`);

  if (!count) {
    console.log("  Nothing to do.");
    return;
  }

  let done = 0;
  let errors = 0;

  while (true) {
    const { data, error } = await supabase
      .from(cfg.table)
      .select(cfg.select)
      .is("embedding", null)
      .limit(BATCH_SIZE);

    if (error) { console.error("  Fetch error:", error.message); break; }
    if (!data || data.length === 0) break;

    for (const row of data as unknown as Record<string, unknown>[]) {
      const text = cfg.textFn(row);
      const lbl  = cfg.label(row);

      if (!text.trim()) {
        console.log(`  SKIP  (empty text) — ${lbl}`);
        // Set empty vector placeholder so we don't re-fetch it forever
        if (!DRY_RUN) {
          await supabase
            .from(cfg.table)
            .update({ embedding: new Array(1536).fill(0) })
            .eq("id", row.id as string);
        }
        done++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  DRY   ${lbl}`);
        done++;
        continue;
      }

      try {
        const embedding = await embed(text);
        const { error: upErr } = await supabase
          .from(cfg.table)
          .update({ embedding })
          .eq("id", row.id as string);

        if (upErr) throw new Error(upErr.message);

        done++;
        process.stdout.write(`\r  ${done}/${count} done  (${errors} errors)   `);
      } catch (err) {
        errors++;
        console.error(`\n  ERROR on ${lbl}:`, err instanceof Error ? err.message : err);
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  ✓ ${done} embedded, ${errors} errors`);
}

async function main() {
  console.log(`\nBackfill embeddings — ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`Model: text-embedding-3-small | Batch: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms\n`);

  for (const cfg of TABLES) {
    await backfillTable(cfg);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
