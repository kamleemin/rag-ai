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
import { PendingVideoStatus } from "../index.js";

/** nomic-embed-text output size. Changing the embedding model means re-embedding every recipe. */
export const EMBEDDING_DIMENSIONS = 768;

// Every table's id is a random UUID made by Postgres (gen_random_uuid()) — not guessable,
// and never sequential, so ids reveal nothing about how many rows exist.

export const recipes = snakeCase.table("recipes", {
  id: uuid().primaryKey().defaultRandom(),
  title: text(),
  description: text(),
  servings: text(),
  prepMinutes: text(),
  cookMinutes: text(),
  ingredients: jsonb().$type<ParsedIngredient[]>().notNull().default([]),
  instructions: text(),
  category: text(),
  calories: integer(),
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

/** Your own ingredient list — checked before USDA when working out calories. */
export const ingredients = snakeCase.table("ingredients", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  brand: text(),
  kcalPer100g: real().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
