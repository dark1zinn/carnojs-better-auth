import { describe, expect, test } from "bun:test";
import { buildAuthClientBaseURL } from "../../src/auth-url.ts";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { withAuthApp } from "../helpers/test-app.ts";

describe("default auth client base URL", () => {
  test("client baseURL matches the default mounted auth routes", () => {
    const appOrigin = "http://127.0.0.1:3000";

    expect(buildAuthClientBaseURL(appOrigin, DEFAULT_AUTH_BASE_PATH)).toBe(
      `${appOrigin}${DEFAULT_AUTH_BASE_PATH}`,
    );
  });

  test("default server config serves session at the client baseURL path", async () => {
    await withAuthApp(async ({ harness }) => {
      const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);
      expect(response.status).not.toBe(404);
    });
  });
});
