import type { RequestHandler } from "express";

/**
 * Turns one CORS_ORIGINS entry into a matcher. A "*" matches one run of letters,
 * digits and dashes, e.g. a branch name in "https://kamasak-git-*-yourteam.vercel.app".
 * It can't match "." or "/", so it never spans into a different domain or path.
 */
function toOriginPattern(allowedOrigin: string): RegExp {
  const escaped = allowedOrigin
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\/]/g, "\\$&"))
    .join("[a-z0-9-]+");
  return new RegExp(`^${escaped}$`, "i");
}

/**
 * Only the listed origins may call this server from a browser. The
 * Allow-Private-Network header answers Chrome's Private/Local Network Access
 * preflight, which it sends when an https:// page calls http://localhost.
 */
export function cors(allowedOrigins: string[]): RequestHandler {
  const patterns = allowedOrigins.map(toOriginPattern);

  return (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && patterns.some((pattern) => pattern.test(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.headers["access-control-request-private-network"] === "true") {
        res.setHeader("Access-Control-Allow-Private-Network", "true");
      }
    }

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  };
}
