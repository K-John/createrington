import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authenticate, requireAdmin } from "@/app/middleware";
import { UnauthorizedError, ForbiddenError } from "@/app/middleware";
import { jwtService } from "@/services/auth/jwt";
import { AuthRole } from "@/services/discord/oauth/oauth.service";

vi.mock("@/services/auth/jwt", () => ({
  jwtService: {
    verify: vi.fn(),
  },
}));

describe("Authentication middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should attach user to request with valid token", async () => {
      const mockPayload = {
        discordId: "123",
        username: "testUser",
        role: AuthRole.USER,
        isAdmin: "false",
        minecraftUuid: "uuid-123",
        minecraftUsername: "adminMC",
      };

      req.headers = {
        authorization: "Bearer valid-token",
      };

      vi.mocked(jwtService.verify).mockReturnValue(mockPayload as any);

      await authenticate(req as Request, res as Response, next);

      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalledWith();
    });

    it("should throw UnauthorizedError when token is missing", async () => {
      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should throw UnauthorizedError when token is invalid", async () => {
      req.headers = {
        authorization: "Bearer invalid-token",
      };

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should handle Bearer prefix correctly", async () => {
      const mockPayload = {
        discordId: "123",
        username: "testUser",
        role: AuthRole.USER,
        isAdmin: false,
        minecraftUuid: "uuid-123",
        minecraftUsername: "adminMC",
      };

      req.headers = {
        authorization: "Bearer token-with-prefix",
      };

      vi.mocked(jwtService.verify).mockReturnValue(mockPayload as any);

      await authenticate(req as Request, res as Response, next);

      expect(jwtService.verify).toHaveBeenCalledWith("token-with-prefix");
    });
  });

  describe("requireAdmin", () => {
    it("should allow admin users", () => {
      req.user = {
        discordId: "123",
        username: "admin",
        role: AuthRole.ADMIN,
        isAdmin: true,
        minecraftUuid: "uuid-123",
        minecraftUsername: "adminMC",
      } as any;

      requireAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should reject non-admin users", () => {
      req.user = {
        discordId: "123",
        username: "admin",
        role: AuthRole.USER,
        isAdmin: false,
        minecraftUuid: "uuid-123",
        minecraftUsername: "adminMC",
      } as any;

      expect(() => {
        requireAdmin(req as Request, res as Response, next);
      }).toThrow(ForbiddenError);
    });

    it("should reject when user is not authenticated", () => {
      expect(() => {
        requireAdmin(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });
  });
});
