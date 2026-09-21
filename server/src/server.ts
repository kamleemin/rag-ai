import express from "express";
import * as z from "zod";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { env } from "./env.js";
import { requireSharedSecret } from "./auth.js";
import { extractFromTikTok } from "./extraction/index.js";
import { parseRecipe } from "./parsing/index.js";

const requestSchema = z.object({ url: z.url() });

const app = express();
app.use(express.json());

app.post("/extract-tiktok", requireSharedSecret, async (req, res) => {
  const parsedRequest = requestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ error: "Body must be { url: string }" });
    return;
  }

  const extraction = await extractFromTikTok(parsedRequest.data.url);

  let recipe: ExtractTikTokResponse["recipe"] = null;
  try {
    recipe = await parseRecipe(extraction);
  } catch (err) {
    console.error("Failed to parse recipe from extracted text:", err);
  }

  const response: ExtractTikTokResponse = { extraction, recipe };
  res.json(response);
});

app.listen(env.PORT, () => {
  console.log(`kamasak server listening on port ${env.PORT}`);
});
