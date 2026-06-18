import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { createTestAuthOptions } from "../helpers/test-auth.ts";
import { withAuthApp } from "../helpers/test-app.ts";

const SPA_ORIGIN = "http://localhost:5173";

const cors = {
  origins: SPA_ORIGIN,
  credentials: true,
};

describe("Better Auth CORS integration", () => {
  test("GET /auth/get-session includes Carno CORS headers for cross-origin requests", async () => {
    await withAuthApp(
      async ({ harness }) => {
        const response = await harness.get(
          `${DEFAULT_AUTH_BASE_PATH}/get-session`,
          { headers: { Origin: SPA_ORIGIN } },
        );

        expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
          SPA_ORIGIN,
        );
        expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
          "true",
        );
      },
      {
        authOptions: {
          ...createTestAuthOptions(),
          cors,
        },
      },
    );
  });

  test("POST /auth/sign-up/email includes Carno CORS headers for cross-origin requests", async () => {
    await withAuthApp(
      async ({ harness }) => {
        const response = await harness.post(
          `${DEFAULT_AUTH_BASE_PATH}/sign-up/email`,
          {
            email: "cors@example.com",
            password: "password123",
            name: "CORS User",
          },
          { headers: { Origin: SPA_ORIGIN } },
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
          SPA_ORIGIN,
        );
        expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
          "true",
        );
      },
      {
        authOptions: {
          ...createTestAuthOptions(),
          cors,
        },
      },
    );
  });

  test("OPTIONS preflight on /auth/* succeeds with Carno CORS config", async () => {
    await withAuthApp(
      async ({ harness }) => {
        const response = await harness.request(
          `${DEFAULT_AUTH_BASE_PATH}/get-session`,
          {
            method: "OPTIONS",
            headers: {
              Origin: SPA_ORIGIN,
              "Access-Control-Request-Method": "GET",
            },
          },
        );

        expect(response.status).toBe(204);
        expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
          SPA_ORIGIN,
        );
        expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
          "GET",
        );
      },
      {
        authOptions: {
          ...createTestAuthOptions(),
          cors,
        },
      },
    );
  });
});
