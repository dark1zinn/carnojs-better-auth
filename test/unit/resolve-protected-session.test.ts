import { describe, expect, test } from "bun:test";
import { APIError } from "better-auth/api";
import { BetterAuthService } from "../../src/better-auth.service.ts";
import {
  apiErrorToResponse,
  UNAUTHORIZED_ERROR_CODE,
  UNAUTHORIZED_ERROR_MESSAGE,
  unauthorizedResponse,
} from "../../src/middleware/auth-api-error.ts";
import { resolveProtectedSession } from "../../src/middleware/resolve-protected-session.ts";

function createAuthService(getSession: () => Promise<unknown>): BetterAuthService {
  return {
    auth: {
      api: { getSession },
    },
  } as BetterAuthService;
}

describe("auth API error responses", () => {
  test("unauthorizedResponse matches Better Auth APIError JSON shape", async () => {
    const response = unauthorizedResponse();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      code: UNAUTHORIZED_ERROR_CODE,
      message: UNAUTHORIZED_ERROR_MESSAGE,
    });
  });

  test("apiErrorToResponse preserves Better Auth error bodies", async () => {
    const error = new APIError("UNAUTHORIZED", {
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
    const response = apiErrorToResponse(error);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  });
});

describe("resolveProtectedSession", () => {
  test("returns unauthorized when getSession resolves to null", async () => {
    const result = await resolveProtectedSession(
      createAuthService(async () => null),
      new Headers(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(await result.response.json()).toEqual({
        code: UNAUTHORIZED_ERROR_CODE,
        message: UNAUTHORIZED_ERROR_MESSAGE,
      });
    }
  });

  test("returns unauthorized when getSession throws an auth error", async () => {
    const result = await resolveProtectedSession(
      createAuthService(async () => {
        throw { status: 401, message: "Invalid session" };
      }),
      new Headers(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(await result.response.json()).toEqual({
        code: UNAUTHORIZED_ERROR_CODE,
        message: UNAUTHORIZED_ERROR_MESSAGE,
      });
    }
  });

  test("preserves APIError bodies from getSession", async () => {
    const result = await resolveProtectedSession(
      createAuthService(async () => {
        throw new APIError("UNAUTHORIZED", {
          code: "SESSION_EXPIRED",
          message: "Session expired",
        });
      }),
      new Headers(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(await result.response.json()).toEqual({
        code: "SESSION_EXPIRED",
        message: "Session expired",
      });
    }
  });

  test("throws ServiceUnavailableException for unexpected failures", async () => {
    await expect(
      resolveProtectedSession(
        createAuthService(async () => {
          throw new Error("Database connection failed");
        }),
        new Headers(),
      ),
    ).rejects.toMatchObject({
      statusCode: 503,
      message: "Authentication service unavailable",
    });
  });
});
