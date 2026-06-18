import { describe, expect, test } from "bun:test";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { wrapAuthHandlerWithCors } from "../../src/routes/cors-auth-handler.ts";

describe("wrapAuthHandlerWithCors", () => {
  const cors = {
    origins: "http://localhost:5173",
    credentials: true,
  };

  test("applies CORS headers to auth responses when Origin is present", async () => {
    const handler = wrapAuthHandlerWithCors(
      () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      cors,
    );

    const response = await handler(
      new Request(`http://127.0.0.1${DEFAULT_AUTH_BASE_PATH}/get-session`, {
        headers: { Origin: "http://localhost:5173" },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:5173",
    );
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
      "true",
    );
  });

  test("handles OPTIONS preflight for auth wildcard paths", async () => {
    const handler = wrapAuthHandlerWithCors(
      () => new Response(null, { status: 405 }),
      cors,
    );

    const response = await handler(
      new Request(`http://127.0.0.1${DEFAULT_AUTH_BASE_PATH}/get-session`, {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:5173" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:5173",
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "GET",
    );
  });
});
