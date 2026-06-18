import { describe, expect, test } from "bun:test";
import { BetterAuthService } from "../../src/better-auth.service.ts";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  resolveProtectedSession,
  UNAUTHORIZED_MESSAGE,
} from "../../src/middleware/resolve-protected-session.ts";

function createAuthService(getSession: () => Promise<unknown>): BetterAuthService {
  return {
    auth: {
      api: { getSession },
    },
  } as BetterAuthService;
}

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
        message: UNAUTHORIZED_MESSAGE,
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
      message: AUTH_UNAVAILABLE_MESSAGE,
    });
  });
});
