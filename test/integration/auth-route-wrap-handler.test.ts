import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { createTestAuthOptions } from "../helpers/test-auth.ts";
import { withAuthApp } from "../helpers/test-app.ts";

describe("auth route wrapHandler", () => {
  test("wrapHandler can attach observability headers to auth routes", async () => {
    await withAuthApp(
      async ({ harness }) => {
        const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);

        expect(response.headers.get("x-request-id")).toMatch(
          /^[0-9a-f-]{36}$/,
        );
      },
      {
        authOptions: {
          ...createTestAuthOptions(),
          wrapHandler: (handler) => async (req) => {
            const requestId = crypto.randomUUID();
            const response = await handler(req);
            const headers = new Headers(response.headers);
            headers.set("x-request-id", requestId);
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            });
          },
        },
      },
    );
  });
});
