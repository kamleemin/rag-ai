import express, { type Request, type Response } from "express";
import * as z from "zod";
import {
  LOCAL_SERVER_PATHS,
  RECIPE_CATEGORIES,
  type AddRecipeResponse,
  type AskResponse,
  type ExtractTikTokResponse,
  type HealthResponse,
} from "@rag-ai/shared";
import { env } from "./env.js";
import { cors } from "./cors.js";
import { extractFromTikTok } from "./extraction/index.js";
import { isOllamaReachable } from "./ollama/index.js";
import { parseRecipe } from "./parsing/index.js";
import { addRecipe } from "./recipes/add.js";
import { askRecipes } from "./recipes/ask.js";
import { embedMissingRecipes } from "./recipes/embedding.js";

const urlRequestSchema = z.object({ url: z.url() });
const askRequestSchema = z.object({ question: z.string().trim().min(1) });

const app = express();
app.use(cors(env.CORS_ORIGINS));
app.use(express.json());

app.get(LOCAL_SERVER_PATHS.health, async (_req, res: Response<HealthResponse>) => {
  if (!(await isOllamaReachable())) {
    res.status(503).json({
      ok: false,
      error: `Ollama isn't reachable at ${env.OLLAMA_BASE_URL}`,
    });
    return;
  }
  res.json({
    ok: true,
    chatModel: env.OLLAMA_MODEL,
    embedModel: env.OLLAMA_EMBED_MODEL,
  });
});

app.post(
  LOCAL_SERVER_PATHS.addRecipe,
  async (req: Request, res: Response<AddRecipeResponse | { error: string }>) => {
    const parsed = urlRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Body must be { url: string }" });
      return;
    }

    try {
      res.json(await addRecipe(parsed.data.url));
    } catch (err) {
      console.error("Failed to add recipe:", err);
      res.status(500).json({ error: "Failed to add recipe from video" });
    }
  }
);

app.post(
  LOCAL_SERVER_PATHS.ask,
  async (req: Request, res: Response<AskResponse | { error: string }>) => {
    const parsed = askRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Body must be { question: string }" });
      return;
    }

    try {
      res.json(await askRecipes(parsed.data.question));
    } catch (err) {
      console.error("Failed to answer question:", err);
      res.status(500).json({ error: "Failed to answer question" });
    }
  }
);

// Legacy: the current add-recipe screen still uses this (extract + parse, nothing saved).
// Remove once the frontend switches to /add-recipe.
app.post(LOCAL_SERVER_PATHS.extractTikTok, async (req, res) => {
  const parsedRequest = urlRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ error: "Body must be { url: string }" });
    return;
  }

  let extraction: ExtractTikTokResponse["extraction"] = { caption: "", transcript: null };
  let recipe: ExtractTikTokResponse["recipe"] = null;
  try {
    extraction = await extractFromTikTok(parsedRequest.data.url);
    recipe = await parseRecipe(extraction, RECIPE_CATEGORIES);
  } catch (err) {
    console.error("Failed to extract or parse recipe:", err);
  }

  const response: ExtractTikTokResponse = { extraction, recipe };
  res.json(response);
});

app.listen(env.PORT, () => {
  console.log(`kamasak server listening on port ${env.PORT}`);
  embedMissingRecipes()
    .then((count) => count && console.log(`Embedded ${count} recipe(s) missing an embedding`))
    .catch((err) => console.error("Failed to backfill recipe embeddings:", err));
});
