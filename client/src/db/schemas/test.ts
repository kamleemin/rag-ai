import { integer, snakeCase, varchar } from "drizzle-orm/pg-core";

export const testTable = snakeCase.table("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});
