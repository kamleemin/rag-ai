import "dotenv/config";
import * as z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  // Only connections from this PC by default. Phones reach it through Tailscale
  // (`tailscale serve` forwards to 127.0.0.1), never straight over Wi-Fi — this server has
  // no login, so it must not listen on the network.
  HOST: z.string().default("127.0.0.1"),
  DATABASE_URL: z.url(),
  // Comma-separated browser origins allowed to call this server (the Vercel app + local dev).
  // "*" matches one branch name, e.g. https://kamasak-git-*-yourteam.vercel.app (see cors.ts).
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    // Browsers send origins without a trailing slash, so "https://x.vercel.app/" would never match.
    .transform((value) => value.split(",").map((origin) => origin.trim().replace(/\/+$/, ""))),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3:8b"),
  // Changing this means every recipe must be re-embedded (`npm run reembed`).
  OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),
  // llama3:8b tops out at 8192; Ollama's default of 4096 can silently cut long captions.
  OLLAMA_NUM_CTX: z.coerce.number().default(8192),
  // Free key from https://fdc.nal.usda.gov/api-key-signup (1,000 requests/hour).
  // DEMO_KEY works for a quick try but only allows ~10 requests/hour.
  USDA_API_KEY: z
    .string()
    .optional()
    .transform((value) => value || "DEMO_KEY"),
  // Cosine similarity below this is treated as "not relevant" for /ask.
  ASK_MIN_SIMILARITY: z.coerce.number().default(0.3),
});

export const env = envSchema.parse(process.env);
