import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";
 
export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.url(),
    // The single login password for the app.
    APP_PASSWORD: z.string().min(12),
    // Signs session cookies. Changing it logs out every device.
    SESSION_SECRET: z.string().min(32),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,

});