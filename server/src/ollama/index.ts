import { EMBEDDING_DIMENSIONS } from "@rag-ai/shared/db";
import { env } from "../env.js";

// Ollama's own HTTP API, relative to OLLAMA_BASE_URL.
const OLLAMA_PATHS = {
  version: "/api/version",
  chat: "/api/chat",
  embed: "/api/embed",
} as const;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatOptions = {
  messages: ChatMessage[];
  /** JSON schema for structured output — the reply is then guaranteed to be valid JSON. */
  format?: object;
  temperature?: number;
};

type ChatResponse = {
  message: { content: string };
  prompt_eval_count?: number;
  eval_count?: number;
};

async function ollamaPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${env.OLLAMA_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Ollama ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function isOllamaReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${env.OLLAMA_BASE_URL}${OLLAMA_PATHS.version}`, {
      signal: AbortSignal.timeout(2_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function chat({
  messages,
  format,
  temperature = 0,
}: ChatOptions): Promise<string> {
  const data = await ollamaPost<ChatResponse>(OLLAMA_PATHS.chat, {
    model: env.OLLAMA_MODEL,
    stream: false,
    think: false,
    format,
    messages,
    options: { num_ctx: env.OLLAMA_NUM_CTX, temperature },
  });

  // Ollama truncates an over-long prompt silently instead of erroring, so surface it here.
  const usedTokens = (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0);
  if (usedTokens >= env.OLLAMA_NUM_CTX) {
    console.warn(
      `Ollama context full (${usedTokens}/${env.OLLAMA_NUM_CTX} tokens) — input was likely cut off. Raise OLLAMA_NUM_CTX.`
    );
  }

  return data.message.content;
}

/**
 * nomic-embed-text needs a task prefix: "search_document" for stored recipes,
 * "search_query" for questions, or retrieval quality drops noticeably.
 */
export async function embed(
  kind: "search_document" | "search_query",
  text: string
): Promise<number[]> {
  const data = await ollamaPost<{ embeddings: number[][] }>(OLLAMA_PATHS.embed, {
    model: env.OLLAMA_EMBED_MODEL,
    input: `${kind}: ${text}`,
    options: { num_ctx: env.OLLAMA_NUM_CTX },
  });

  const [embedding] = data.embeddings;
  if (embedding?.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected a ${EMBEDDING_DIMENSIONS}-dim embedding from ${env.OLLAMA_EMBED_MODEL}, got ${embedding?.length}`
    );
  }
  return embedding;
}
