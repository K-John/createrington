import config from "@/config";
import { UnauthorizedError } from "./error-handler";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

/**
 * JWT secret shared with PresenceAPI and Createrington Currency
 */
const JWT_SECRET = config.app.auth.jwt.secret;

/**
 * Verify JWT token from mods
 *
 * The mod generates short-lived JWTs (60 seconds) for each request
 * This middleware validates the signature and expiration
 *
 * @throws {UnauthorizedError} if token is missing, invalid, or expired
 */
export const verifyModJwt = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedError("Nod authentication required");
    }

    const parts = token.split(",");
    if (parts.length !== 3) {
      throw new UnauthorizedError("Invalid token format");
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(dataToVerify)
      .digest("base64url");

    if (signature !== expectedSignature) {
      throw new UnauthorizedError("Invalid token signature");
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(),
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedError("Token has expired");
    }

    if (payload.iat && payload.iat > now + 60) {
      throw new UnauthorizedError("Token issued in the future");
    }

    req.modAuth = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error("Mod JWT verification failed:", error);
      next(new UnauthorizedError("Invalid or expired mod token"));
    }
  }
};
