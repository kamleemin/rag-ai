import { PATHNAMES } from "./pathnames";

/** The login page's query parameter for where to go after logging in: /login?next=/recipes/add?url=… */
export const NEXT_PARAM = "next";

/**
 * The page to return to after logging in, or null. Only paths inside this app are
 * allowed — "//evil.com" or "https://…" would send you to another site after login.
 */
export function toSafeNextPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  // "/\evil.com" is treated as "//evil.com" by browsers.
  if (value.startsWith("/\\") || value.startsWith(PATHNAMES.login)) {
    return null;
  }
  return value;
}

/** /login?next=<path>, for sending a logged-out visitor to log in and come back. */
export function loginPathFor(returnTo: string): string {
  const safe = toSafeNextPath(returnTo);
  return safe && safe !== PATHNAMES.homepage
    ? `${PATHNAMES.login}?${new URLSearchParams({ [NEXT_PARAM]: safe })}`
    : PATHNAMES.login;
}
