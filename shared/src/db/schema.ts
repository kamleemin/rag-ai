import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  real,
  snakeCase,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import type {
  CalorieConfidence,
  CalorieLine,
  ParsedIngredient,
} from "../index.js";
import { IngredientSource, PendingVideoStatus } from "../index.js";

/** nomic-embed-text output size. Changing the embedding model means re-embedding every recipe. */
export const EMBEDDING_DIMENSIONS = 768;

// Every table's id is a random UUID made by Postgres (gen_random_uuid()) — not guessable,
// and never sequential, so ids reveal nothing about how many rows exist.

/** Recipe categories (Pasta, Dessert…). Recipes point at one by id, so renaming one renames it everywhere. */
export const categories = snakeCase.table("categories", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const recipes = snakeCase.table("recipes", {
  id: uuid().primaryKey().defaultRandom(),
  // The readable part of recipe links (/recipes/shio-pan-x7kp2m) — see generateShortId.
  shortId: text().notNull().unique(),
  title: text(),
  description: text(),
  servings: text(),
  // From the video (stated in it, or estimated from the steps) — never typed in.
  totalMinutes: integer(),
  ingredients: jsonb().$type<ParsedIngredient[]>().notNull().default([]),
  instructions: text(),
  // Deleting a category leaves its recipes uncategorised rather than deleting them.
  categoryId: uuid().references(() => categories.id, { onDelete: "set null" }),
  calories: integer(),
  // calories ÷ servings, saved alongside them; a servings range ("2-3") uses its midpoint.
  caloriesPerServing: integer(),
  calorieConfidence: text().$type<CalorieConfidence>(),
  calorieBreakdown: jsonb().$type<CalorieLine[]>().notNull().default([]),
  // Null for manually entered recipes; unique so the same video is never saved twice.
  sourceUrl: text().unique(),
  needsReview: boolean().notNull().default(false),
  // Null means "not embedded yet" — the local server backfills these before answering questions.
  embedding: vector({ dimensions: EMBEDDING_DIMENSIONS }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const pendingVideoStatus = pgEnum("pending_video_status", PendingVideoStatus);

export const pendingVideos = snakeCase.table("pending_videos", {
  id: uuid().primaryKey().defaultRandom(),
  url: text().notNull().unique(),
  status: pendingVideoStatus().notNull().default(PendingVideoStatus.Pending),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const ingredientSource = pgEnum("ingredient_source", IngredientSource);

/** Your own ingredient list — checked before USDA when working out calories. */
export const ingredients = snakeCase.table("ingredients", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  brand: text(),
  kcalPer100g: real().notNull(),
  // Optional — not every label lists them. Grams per 100 g.
  fatPer100g: real(),
  // US labels count fibre inside carbs; EU/UK labels don't. Stored as the label gives it.
  carbsPer100g: real(),
  fibrePer100g: real(),
  proteinPer100g: real(),
  source: ingredientSource().notNull().default(IngredientSource.Manual),
  // The product's barcode when imported from Open Food Facts, to link back to it.
  openFoodFactsCode: text(),
  // The USDA food's id when picked from USDA. Its household measures ("1 cup = 125 g")
  // convert recipe amounts for this entry.
  usdaFdcId: integer(),
  // The food's name where it came from ("Chicken, broilers or fryers, meat and skin, raw"),
  // since you usually rename imports to how recipes write them ("Whole chicken").
  sourceName: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
