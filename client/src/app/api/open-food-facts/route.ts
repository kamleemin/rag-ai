import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { apiError } from "@/lib/api-error";
import { captureException } from "@/lib/capture-exception";
import { rejectWithoutSession } from "@/lib/session";
import type { OpenFoodFactsProduct, SearchOpenFoodFactsResponse } from "@/types";

// Open Food Facts' search service (free, no key). It asks apps to identify themselves
// with a User-Agent, and allows about 10 searches a minute.
const SEARCH_URL = "https://search.openfoodfacts.org/search";
const USER_AGENT = "Kamasak/0.1 (personal recipe app)";
const PAGE_SIZE = 20;
const TIMEOUT_MS = 10_000;

const querySchema = z.string().trim().min(2).max(100);

const nutrimentsSchema = z.object({
  "energy-kcal_100g": z.number().optional(),
  fat_100g: z.number().optional(),
  carbohydrates_100g: z.number().optional(),
  fiber_100g: z.number().optional(),
  proteins_100g: z.number().optional(),
});

const searchResponseSchema = z.object({
  hits: z.array(
    z.object({
      code: z.string(),
      product_name: z.string().optional(),
      // An array on this API; a comma-separated string on older ones.
      brands: z.union([z.array(z.string()), z.string()]).optional(),
      quantity: z.string().optional(),
      nutriments: nutrimentsSchema.optional(),
    })
  ),
});

type SearchHit = z.infer<typeof searchResponseSchema>["hits"][number];

/** 366.66666666667 → 366.7; missing → null. */
function round(value: number | undefined): number | null {
  return value === undefined ? null : Math.round(value * 10) / 10;
}

function firstBrand(brands: SearchHit["brands"]): string | null {
  const [brand] = typeof brands === "string" ? brands.split(",") : (brands ?? []);
  return brand?.trim() || null;
}

/** Products without a name or calories can't go in the list, so they're left out. */
function toProduct({ code, product_name, brands, quantity, nutriments }: SearchHit): OpenFoodFactsProduct[] {
  const name = product_name?.trim();
  const kcal = round(nutriments?.["energy-kcal_100g"]);
  if (!name || kcal === null) {
    return [];
  }
  return [
    {
      code,
      name,
      brand: firstBrand(brands),
      quantity: quantity?.trim() || null,
      kcalPer100g: kcal,
      fatPer100g: round(nutriments?.fat_100g),
      carbsPer100g: round(nutriments?.carbohydrates_100g),
      fibrePer100g: round(nutriments?.fiber_100g),
      proteinPer100g: round(nutriments?.proteins_100g),
    },
  ];
}

/** Searches Open Food Facts products by name, e.g. ?query=bread%20flour. */
export async function GET(request: NextRequest) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rawQuery = request.nextUrl.searchParams.get("query") ?? "";
  const parsedQuery = querySchema.safeParse(rawQuery);
  if (!parsedQuery.success) {
    return apiError("INVALID_QUERY", `query must be 2–100 characters, got "${rawQuery}"`);
  }

  const url = `${SEARCH_URL}?${new URLSearchParams({
    q: parsedQuery.data,
    page_size: String(PAGE_SIZE),
    fields: "code,product_name,brands,quantity,nutriments",
  })}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    captureException(error, "Failed to reach Open Food Facts search");
    return apiError("OPEN_FOOD_FACTS_FAILED", `Could not reach ${SEARCH_URL}: ${String(error)}`);
  }
  if (res.status === 429) {
    return apiError("OPEN_FOOD_FACTS_RATE_LIMITED", "Open Food Facts search responded 429");
  }
  if (!res.ok) {
    return apiError("OPEN_FOOD_FACTS_FAILED", `Open Food Facts search responded ${res.status}`);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (error) {
    captureException(error, "Open Food Facts search returned invalid JSON");
    return apiError("OPEN_FOOD_FACTS_FAILED", `Invalid JSON from Open Food Facts: ${String(error)}`);
  }
  const parsed = searchResponseSchema.safeParse(body);
  if (!parsed.success) {
    captureException(parsed.error, "Open Food Facts search response had an unexpected shape");
    return apiError("OPEN_FOOD_FACTS_FAILED", z.prettifyError(parsed.error));
  }

  return NextResponse.json<SearchOpenFoodFactsResponse>({
    products: parsed.data.hits.flatMap(toProduct),
  });
}
