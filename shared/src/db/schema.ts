import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  real,
  snakeCase,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";
import type {
  CalorieConfidence,
  CalorieLine,
  ParsedIngredient,
} from "../index.js";

/** nomic-embed-text output size. Changing the embedding model means re-embedding every recipe. */
export const EMBEDDING_DIMENSIONS = 768;

export const recipes = snakeCase.table("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
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

export const pendingVideoStatus = pgEnum("pending_video_status", [
  "pending",
  "failed",
]);

export const pendingVideos = snakeCase.table("pending_videos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text().notNull().unique(),
  status: pendingVideoStatus().notNull().default("pending"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Your own ingredient list — checked before USDA when working out calories. */
export const ingredients = snakeCase.table("ingredients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  brand: text(),
  kcalPer100g: real().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
