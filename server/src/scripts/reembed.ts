/** Run after changing OLLAMA_EMBED_MODEL: old and new vectors aren't comparable. */
import { recipes } from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { embedMissingRecipes } from "../recipes/embedding.js";

await db.update(recipes).set({ embedding: null });
const count = await embedMissingRecipes();
console.log(`Re-embedded ${count} recipe(s)`);
