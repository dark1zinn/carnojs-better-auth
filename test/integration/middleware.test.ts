import { describe, expect, test } from "bun:test";
import {
  Controller,
  Get,
  Locals,
  Middleware,
  withTestApp,
} from "@carno.js/core";
import type { TestHelpers } from "better-auth/plugins";
import { CarnoBetterAuth } from "../../src/entry.ts";
import { AUTH_USER_KEY } from "../../src/constants.ts";
import { BetterAuthMiddleware } from "../../src/middleware/better-auth.middleware.ts";
import { BetterAuthService } from "../../src/better-auth.service.ts";
import { createTestAuthOptions } from "../helpers/test-auth.ts";

@Controller("/profile")
@Middleware(BetterAuthMiddleware)
class ProfileController {
  @Get()
  profile(@Locals(AUTH_USER_KEY) user: { email: string }) {
    return { authenticated: true, email: user.email };
  }
}

describe("BetterAuthMiddleware", () => {
  test("returns 401 when no session is present", async () => {
    await withTestApp(
      async (harness) => {
        const response = await harness.get("/profile");
        expect(response.status).toBe(401);
      },
      {
        plugins: [CarnoBetterAuth(createTestAuthOptions())],
        controllers: [ProfileController],
        services: [BetterAuthMiddleware],
        listen: true,
      },
    );
  });

  test("allows access and exposes the user via locals when authenticated", async () => {
    await withTestApp(
      async (harness) => {
        const authService = harness.resolve(BetterAuthService);
        const ctx = await authService.auth.$context;
        const test: TestHelpers = ctx.test;

        const user = test.createUser({ email: "protected@example.com" });
        await test.saveUser(user);
        const { headers } = await test.login({ userId: user.id });

        const response = await harness.get("/profile", { headers });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.authenticated).toBe(true);
        expect(body.email).toBe("protected@example.com");
      },
      {
        plugins: [CarnoBetterAuth(createTestAuthOptions())],
        controllers: [ProfileController],
        services: [BetterAuthMiddleware],
        listen: true,
      },
    );
  });
});
