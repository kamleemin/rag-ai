// this file is used to intercept and run code before request is completed

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PATHNAMES } from "@/lib/pathnames";

// Next.js will check the incoming pathname against config.matcher
// if pathname matched, it will run the proxy
// note: matcher must be a static string literal — Next.js statically
// parses this at build time, so it can't reference PATHNAMES here.
export const config = {
  matcher: "/home",
};

// runs before rendering route
export function proxy(request: NextRequest) {
  // in this case i want the page to redirect to "/" if user goes to "/home"
  return NextResponse.redirect(new URL(PATHNAMES.homepage, request.url));
}
