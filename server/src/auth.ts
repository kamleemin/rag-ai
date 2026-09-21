import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";

export function requireSharedSecret(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const provided = req.header("x-api-key");
  if (provided !== env.API_SHARED_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
