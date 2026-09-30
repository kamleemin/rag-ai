import * as z from "zod";
import { env } from "../env.js";

const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1";
// Basic foods only: SR Legacy (raw produce, meat, staples, spices) and Foundation
// (minimally processed foods). The "Survey (FNDDS)" dataset of prepared dishes is left
// out on purpose — it's where wrong matches like "Egg, Benedict" and "Dirty rice" came from.
// Their household measures need a second request (getUsdaMeasures).
const USDA_DATA_TYPES = ["SR Legacy", "Foundation"];
const ENERGY_KCAL_NUTRIENT_ID = 1008;
// USDA ranks plain foods badly for one-word searches (whole milk is #94 for "milk",
// plain rice isn't in the top 100), so fetch everything up to USDA's maximum and let
// the matching rules rank. One-word searches have ~100–250 results in total.
const CANDIDATES_PER_SEARCH = 200;
// "RACC" is a labelling reference amount, not a household measure like "1 cup".
const NON_HOUSEHOLD_MEASURE = /\bRACC\b/;
const MAX_ATTEMPTS = 3;

export type UsdaMeasure = { text: string; grams: number };

export type UsdaFood = {
  fdcId: number;
  description: string;
  dataType: string;
  kcalPer100g: number;
  /** Usually empty in search results — call getUsdaMeasures. */
  measures: UsdaMeasure[];
};

const searchResponseSchema = z.object({
  foods: z.array(
    z.object({
      fdcId: z.number(),
      description: z.string(),
      dataType: z.string(),
      foodNutrients: z.array(
        z.object({ nutrientId: z.number(), value: z.number().optional() })
      ),
      foodMeasures: z
        .array(z.object({ disseminationText: z.string(), gramWeight: z.number() }))
        .optional(),
    })
  ),
});

const foodDetailsSchema = z.array(
  z.object({
    foodPortions: z
      .array(
        z.object({
          amount: z.number().optional(),
          modifier: z.string().optional(),
          portionDescription: z.string().optional(),
          measureUnit: z.object({ name: z.string() }).optional(),
          gramWeight: z.number(),
        })
      )
      .optional(),
  })
);

/**
 * POST, not GET: the GET search randomly answers 400 from USDA's gateway
 * (the same URL fails about 1 in 3 times), while POST has been reliable.
 */
async function usdaPost(path: string, body: object): Promise<unknown> {
  const url = `${USDA_API_URL}${path}?api_key=${encodeURIComponent(env.USDA_API_KEY)}`;
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      // Rate limited: retrying straight away won't help.
      if (res.status === 429) {
        throw new Error("USDA rate limit reached — set USDA_API_KEY to your own free key");
      }
      // Error pages come back as HTML, so only parse JSON from a successful response.
      if (res.ok) return JSON.parse(await res.text());
      lastError = new Error(`USDA ${path} failed: ${res.status}`);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("USDA rate limit")) throw err;
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
  }
  throw lastError;
}

/** Reuse results while the server runs — failures are dropped so the next call retries. */
function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
  const existing = cache.get(key);
  if (existing) return existing;
  const result = load();
  result.catch(() => cache.delete(key));
  cache.set(key, result);
  return result;
}

const searchCache = new Map<string, Promise<UsdaFood[]>>();
const measuresCache = new Map<string, Promise<UsdaMeasure[]>>();

/** Candidate foods for a query, in USDA's order — rank with rankFoods, not the first result. */
export function searchUsdaFoods(query: string): Promise<UsdaFood[]> {
  const key = query.trim().toLowerCase();
  return cached(searchCache, key, async () => {
    const data = await usdaPost("/foods/search", {
      query: key,
      dataType: USDA_DATA_TYPES,
      pageSize: CANDIDATES_PER_SEARCH,
    });
    return searchResponseSchema.parse(data).foods.flatMap((food) => {
      const kcal = food.foodNutrients.find(
        (n) => n.nutrientId === ENERGY_KCAL_NUTRIENT_ID
      )?.value;
      if (kcal === undefined) return [];
      return [
        {
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          kcalPer100g: kcal,
          measures: (food.foodMeasures ?? []).map((m) => ({
            text: m.disseminationText,
            grams: m.gramWeight,
          })),
        },
      ];
    });
  });
}

/** Household measures for a food ("1 cup = 100 g") — SR Legacy and Foundation only return them from the details endpoint. */
export function getUsdaMeasures(food: UsdaFood): Promise<UsdaMeasure[]> {
  if (food.measures.length > 0) return Promise.resolve(food.measures);

  return cached(measuresCache, String(food.fdcId), async () => {
    const data = await usdaPost("/foods", { fdcIds: [food.fdcId], format: "full" });
    const [details] = foodDetailsSchema.parse(data);
    const measures = (details?.foodPortions ?? []).map((portion) => {
      // SR Legacy: amount=1, modifier="tbsp, ground". Foundation: measureUnit.name="cup".
      const unit =
        portion.measureUnit && portion.measureUnit.name !== "undetermined"
          ? portion.measureUnit.name
          : "";
      const label = [unit, portion.modifier ?? portion.portionDescription ?? ""]
        .filter(Boolean)
        .join(" ");
      return { text: `${portion.amount ?? 1} ${label}`, grams: portion.gramWeight };
    });
    return measures.filter((m) => !NON_HOUSEHOLD_MEASURE.test(m.text));
  });
}
