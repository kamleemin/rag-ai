import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const clientEnv = createEnv({
  client: {
    // The recipe server on the PC, as the browser reaches it: http://localhost:8080 on the
    // PC itself, or its Tailscale address (https://<pc>.<tailnet>.ts.net) on the deployed
    // site so the phone can reach it too. Baked in at build time — redeploy after changing.
    NEXT_PUBLIC_RECIPE_SERVER_URL: z
      .url()
      .default("http://localhost:8080")
      .transform((url) => url.replace(/\/+$/, "")),
  },
  runtimeEnv: {
    NEXT_PUBLIC_RECIPE_SERVER_URL: process.env.NEXT_PUBLIC_RECIPE_SERVER_URL,
  },
  emptyStringAsUndefined: true,
});
