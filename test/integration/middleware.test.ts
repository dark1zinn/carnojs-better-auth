import { describe, expect, test } from "bun:test";
import {
  Controller,
  Get,
  Locals,
  Middleware,
} from "@carno.js/core";
import { AUTH_USER_KEY } from "../../src/constants.ts";
import { BetterAuthMiddleware } from "../../src/middleware/better-auth.middleware.ts";
import { withAuthApp } from "../helpers/test-app.ts";
import { readJson } from "../helpers/response.ts";

type ProfileBody = { authenticated: boolean; email: string };

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
    await withAuthApp(
      async ({ harness }) => {
        const response = await harness.get("/profile");
        expect(response.status).toBe(401);
      },
      { controllers: [ProfileController], services: [BetterAuthMiddleware] },
    );
  });

  test("allows access and exposes the user via locals when authenticated", async () => {
    await withAuthApp(
      async ({ harness, test }) => {
        const user = test.createUser({ email: "protected@example.com" });
        await test.saveUser(user);
        const { headers } = await test.login({ userId: user.id });

        const response = await harness.get("/profile", { headers });
        const body = await readJson<ProfileBody>(response);

        expect(response.status).toBe(200);
        expect(body.authenticated).toBe(true);
        expect(body.email).toBe("protected@example.com");
      },
      { controllers: [ProfileController], services: [BetterAuthMiddleware] },
    );
  });
});
