import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AppConfig } from "./config";

// Strong HMAC secret: from the environment if it is long enough, otherwise random per process.
const envSecret = process.env.JWT_SECRET;
const SECRET = envSecret && envSecret.length >= 32 ? envSecret : crypto.randomBytes(48).toString("hex");

export function createAuth(config: AppConfig) {
  const issue = (sub: string): string =>
    jwt.sign({ sub }, SECRET, {
      algorithm: "HS256",
      issuer: config.jwt.issuer,
      expiresIn: config.jwt.expiresIn,
    });

  // jwt.verify is called on every protected request, but with an explicit
  // algorithm allow-list (CVE-2022-23540), a static symmetric secret rather
  // than an asymmetric/legacy key (CVE-2022-23539), and no key-lookup
  // callback (CVE-2022-23541).
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    try {
      const payload = jwt.verify(token, SECRET, { algorithms: ["HS256"], issuer: config.jwt.issuer });
      res.locals.user = payload;
      next();
    } catch {
      res.status(401).json({ error: "unauthorized" });
    }
  };

  return { issue, requireAuth };
}
