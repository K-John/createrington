import { ServerInfo } from "@/app/middleware/auth/presence-api.auth";
import { JWTPayload } from "@/services/auth/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      modAuth?: ServerInfo;
      clientIp?: string;
    }
  }
}

export {};
