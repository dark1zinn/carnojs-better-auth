import { describe, expect, test } from "bun:test";
import { withTestApp } from "@carno.js/core";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createBetterAuthPlugin } from "../../src/better-auth.plugin.ts";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";

function createPluginOptions() {
  return {
    database: memoryAdapter({}),
    emailAndPassword: { enabled: true },
  };
}

describe("createBetterAuthPlugin", () => {
  test("mounts Better Auth routes under /auth", async () => {
    await withTestApp(
      async (harness) => {
        const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);
        expect(response.status).not.toBe(404);
      },
      {
        plugins: [createBetterAuthPlugin(createPluginOptions())],
        listen: true,
      },
    );
  });

  test("forwards nested auth paths to Better Auth", async () => {
    await withTestApp(
      async (harness) => {
        const response = await harness.post(
          `${DEFAULT_AUTH_BASE_PATH}/sign-up/email`,
          {
            email: "nested@example.com",
            password: "password123",
            name: "Nested Test",
          },
        );

        expect(response.status).not.toBe(404);
        expect(response.status).not.toBe(405);
      },
      {
        plugins: [createBetterAuthPlugin(createPluginOptions())],
        listen: true,
      },
    );
  });

  test("exposes BetterAuthService from the plugin export", async () => {
    await withTestApp(
      async (harness) => {
        const { BetterAuthService } = await import(
          "../../src/better-auth.service.ts"
        );
        const service = harness.resolve(BetterAuthService);
        expect(typeof service.auth.handler).toBe("function");
      },
      {
        plugins: [createBetterAuthPlugin(createPluginOptions())],
        listen: true,
      },
    );
  });
});
