import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { searchUsdaIngredients, type UsdaFood } from "@rag-ai/shared/nutrition";
import { serverEnv } from "@/data/serverEnv";
import { apiError } from "@/lib/api-error";
import { captureException } from "@/lib/capture-exception";
import { rejectWithoutSession } from "@/lib/session";
import type { SearchUsdaFoodsResponse, UsdaFoodResult } from "@/types";

// Enough to find the right one without a long list to scroll.
const MAX_RESULTS = 25;

const querySchema = z.string().trim().min(2).max(100);

/** 366.66666666667 → 366.7; missing → null. */
function round(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10) / 10;
}

function toResult(food: UsdaFood): UsdaFoodResult {
  return {
    fdcId: food.fdcId,
    name: food.description,
    kcalPer100g: round(food.kcalPer100g) ?? 0,
    fatPer100g: round(food.fatPer100g),
    carbsPer100g: round(food.carbsPer100g),
    fibrePer100g: round(food.fibrePer100g),
    proteinPer100g: round(food.proteinPer100g),
  };
}

/**
 * Searches USDA's basic foods (the same ones calorie calculation uses), plain foods first —
 * for picking the right food when "Calculate calories" matched the wrong one.
 */
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

  let foods: UsdaFood[];
  try {
    foods = await searchUsdaIngredients(parsedQuery.data, serverEnv.USDA_API_KEY);
  } catch (error) {
    captureException(error, `USDA search failed for "${parsedQuery.data}"`);
    return apiError("USDA_SEARCH_FAILED", `USDA search failed: ${String(error)}`);
  }

  return NextResponse.json<SearchUsdaFoodsResponse>({
    foods: foods.slice(0, MAX_RESULTS).map(toResult),
  });
}
