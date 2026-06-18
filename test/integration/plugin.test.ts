import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { withAuthApp } from "../helpers/test-app.ts";

describe("CarnoBetterAuth", () => {
  test("mounts Better Auth routes under /auth", async () => {
    await withAuthApp(async ({ harness }) => {
      const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);
      expect(response.status).not.toBe(404);
    });
  });

  test("forwards nested auth paths to Better Auth", async () => {
    await withAuthApp(async ({ harness }) => {
      const response = await harness.post(
        `${DEFAULT_AUTH_BASE_PATH}/sign-up/email`,
        {
          email: "nested@example.com",
          password: "password123",
          name: "Nested Test",
        },
      );

      expect(response.status).toBe(200);
    });
  });

  test("exposes BetterAuthService from the plugin export", async () => {
    await withAuthApp(async ({ harness, auth }) => {
      const service = harness.resolve(
        (await import("../../src/better-auth.service.ts")).BetterAuthService,
      );
      expect(service.auth).toBe(auth.auth);
      expect(typeof service.auth.handler).toBe("function");
    });
  });
});
