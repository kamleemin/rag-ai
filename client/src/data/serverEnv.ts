import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";
 
export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.url(),
    // The single login password for the app.
    APP_PASSWORD: z.string().min(12),
    // Signs session cookies. Changing it logs out every device.
    SESSION_SECRET: z.string().min(32),
    // USDA FoodData Central key for working out calories when a recipe is saved
    // (free: https://fdc.nal.usda.gov/api-key-signup). DEMO_KEY only allows ~10 requests/hour.
    USDA_API_KEY: z.string().default("DEMO_KEY"),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,

});