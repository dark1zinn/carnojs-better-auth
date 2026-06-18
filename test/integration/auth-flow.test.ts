import { describe, expect, test } from "bun:test";
import {
  Controller,
  Get,
  Locals,
  Middleware,
} from "@carno.js/core";
import {
  AUTH_SESSION_KEY,
  AUTH_USER_KEY,
  DEFAULT_AUTH_BASE_PATH,
} from "../../src/constants.ts";
import { BetterAuthMiddleware } from "../../src/middleware/better-auth.middleware.ts";
import { withAuthApp } from "../helpers/test-app.ts";
import { readJson } from "../helpers/response.ts";

type AuthUser = { email: string; name?: string; id: string };
type SignUpBody = { user: AuthUser };
type SessionBody = { user: AuthUser; session: { userId: string } };
type MeBody = { email: string; userId: string; sessionUserId: string };

@Controller("/me")
@Middleware(BetterAuthMiddleware)
class MeController {
  @Get()
  me(
    @Locals(AUTH_USER_KEY) user: { email: string; id: string },
    @Locals(AUTH_SESSION_KEY) session: { userId: string },
  ) {
    return {
      email: user.email,
      userId: user.id,
      sessionUserId: session.userId,
    };
  }
}

describe("Better Auth end-to-end flow", () => {
  test("sign-up via HTTP creates a user through the Carno plugin", async () => {
    await withAuthApp(async ({ harness }) => {
      const response = await harness.post(
        `${DEFAULT_AUTH_BASE_PATH}/sign-up/email`,
        {
          email: "signup@example.com",
          password: "password123",
          name: "Sign Up User",
        },
      );

      expect(response.status).toBe(200);

      const body = await readJson<SignUpBody>(response);
      expect(body.user.email).toBe("signup@example.com");
      expect(body.user.name).toBe("Sign Up User");
    });
  });

  test("get-session returns the authenticated user after sign-up", async () => {
    await withAuthApp(async ({ harness }) => {
      const email = "session-flow@example.com";

      const signUp = await harness.post(
        `${DEFAULT_AUTH_BASE_PATH}/sign-up/email`,
        {
          email,
          password: "password123",
          name: "Session Flow User",
        },
      );

      expect(signUp.status).toBe(200);

      const cookie = signUp.headers.get("set-cookie");
      expect(cookie).toBeTruthy();

      const sessionResponse = await harness.get(
        `${DEFAULT_AUTH_BASE_PATH}/get-session`,
        { headers: { cookie: cookie! } },
      );

      expect(sessionResponse.status).toBe(200);

      const sessionBody = await readJson<SessionBody>(sessionResponse);
      expect(sessionBody.user.email).toBe(email);
      expect(sessionBody.session.userId).toBe(sessionBody.user.id);
    });
  });

  test("protected Carno route accepts session cookies from Better Auth", async () => {
    await withAuthApp(
      async ({ harness, test }) => {
        const email = "protected-flow@example.com";
        const user = test.createUser({ email });
        await test.saveUser(user);

        const { headers } = await test.login({ userId: user.id });
        const response = await harness.get("/me", { headers });
        const body = await readJson<MeBody>(response);

        expect(response.status).toBe(200);
        expect(body.email).toBe(email);
        expect(body.userId).toBe(user.id);
        expect(body.sessionUserId).toBe(user.id);
      },
      { controllers: [MeController], services: [BetterAuthMiddleware] },
    );
  });

  test("auth.api.getSession matches the HTTP session endpoint", async () => {
    await withAuthApp(async ({ harness, auth, test }) => {
      const email = "api-parity@example.com";
      const user = test.createUser({ email });
      await test.saveUser(user);

      const { headers } = await test.login({ userId: user.id });

      const httpSession = await readJson<SessionBody>(
        await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`, {
          headers,
        }),
      );

      const apiSession = await auth.auth.api.getSession({ headers });

      expect(apiSession).not.toBeNull();
      expect(apiSession!.user.email).toBe(email);
      expect(httpSession.user.email).toBe(email);
      expect(httpSession.session.userId).toBe(apiSession!.session.userId);
    });
  });

  test("cleans up users created through testUtils", async () => {
    await withAuthApp(async ({ auth, test }) => {
      const user = test.createUser({ email: "cleanup@example.com" });
      await test.saveUser(user);

      const { headers } = await test.login({ userId: user.id });
      const before = await auth.auth.api.getSession({ headers });
      expect(before?.user.id).toBe(user.id);

      await test.deleteUser(user.id);

      const after = await auth.auth.api.getSession({ headers });
      expect(after).toBeNull();
    });
  });
});
