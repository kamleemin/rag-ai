// this file is used to intercept and run code before request is completed

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PATHNAMES } from "@/lib/pathnames";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";

// Next.js will check the incoming pathname against config.matcher
// if pathname matched, it will run the proxy
// note: matcher must be a static string literal — Next.js statically
// parses this at build time, so it can't reference PATHNAMES here.
// Runs on every page, but not on API routes (they check the session themselves),
// Next.js internals, or files with an extension (images, favicon).
//
// how to read the regex: "/((?!A|B|C).*)" means "any path that does NOT start with A, B or C"
// - api          → /api/... routes are skipped (each route checks the session itself)
// - _next/static → Next.js's own JS/CSS bundles, must load even when logged out
// - _next/image  → Next.js's image optimizer
// - .*\\..*      → anything with a dot, i.e. a file like /next.svg or /favicon.ico
export const config = {
  matcher: "/((?!api|_next/static|_next/image|.*\\..*).*)",
};

// runs before rendering route
// every path through this function ends in one of two returns:
// - NextResponse.redirect(url) → stop here, tell the browser to go to `url` instead
// - NextResponse.next()        → "carry on", let Next.js render the page that was asked for
export async function proxy(request: NextRequest) {
  // e.g. for http://localhost:3000/recipes?x=1 → pathname = "/recipes"
  const { pathname } = request.nextUrl;

  // The browser sends the session cookie automatically with every request (set by /api/login).
  // isValidSessionToken checks its signature and expiry, so a missing, fake or expired cookie → false.
  // Only reads the signed cookie — no DB call — so it stays cheap on every navigation.
  // The API routes re-check the session, so this is a UX redirect, not the security boundary.
  const isLoggedIn = await isValidSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  // Case 1: the user is opening the login page itself.
  // This check must come before case 2 — otherwise a logged-out user visiting /login
  // would be redirected to /login again, forever.
  if (pathname === PATHNAMES.login) {
    return isLoggedIn
      ? // already logged in → no point showing the form, send them home
        NextResponse.redirect(new URL(PATHNAMES.homepage, request.url))
      : // logged out → show the login page as normal
        NextResponse.next();
  }

  // Case 2: any other page, and the user is logged out → send them to the login page.
  // After logging in, useLoginForm always sends them to the homepage.
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(PATHNAMES.login, request.url));
  }

  // Case 3: any other page, and the user is logged in → render the page as normal.
  return NextResponse.next();
}
