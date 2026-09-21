import "dotenv/config";
import * as z from "zod";

const envSchema = z.object({
  PORT: z.string().default("8080"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("qwen3:8b"),
});

export const env = envSchema.parse(process.env);
