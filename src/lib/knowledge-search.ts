import { createClient } from "@supabase/supabase-js";
import { createEmbedding } from "./embeddings";

function getSupabaseForSearch() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type KnowledgeChunk = {
  id: string;
  content: string;
  source: string;
  similarity: number;
};

export async function searchKnowledge(
  question: string,
  propertyId?: string | null,
  options?: { threshold?: number; count?: number }
): Promise<KnowledgeChunk[]> {
  const threshold = options?.threshold ?? 0.70;
  const count     = options?.count     ?? 6;

  let embedding: number[];
  try {
    embedding = await createEmbedding(question);
  } catch (err) {
    console.error("Embedding failed, skipping semantic search:", err);
    return [];
  }

  const supabase = getSupabaseForSearch();
  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    property_id_filter: propertyId ?? null,
    match_threshold: threshold,
    match_count: count,
  });

  if (error) {
    console.error("match_knowledge RPC error:", error.message);
    return [];
  }

  return (data ?? []) as KnowledgeChunk[];
}
