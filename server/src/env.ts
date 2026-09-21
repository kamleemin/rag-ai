import "dotenv/config";
import * as z from "zod";

const envSchema = z.object({
  PORT: z.string().default("8080"),
  API_SHARED_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
