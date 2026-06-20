import { describe, expect, test } from "bun:test";
import { composeAuthRouteHandler } from "../../src/routes/compose-auth-handler.ts";

describe("composeAuthRouteHandler", () => {
  test("applies wrapHandler before the base handler runs", async () => {
    const order: string[] = [];

    const handler = composeAuthRouteHandler(
      async () => {
        order.push("auth");
        return new Response("ok");
      },
      {
        wrapHandler: (next) => async (req) => {
          order.push("wrap-before");
          const response = await next(req);
          order.push("wrap-after");
          return response;
        },
      },
    );

    await handler(new Request("http://127.0.0.1/auth/get-session"));

    expect(order).toEqual(["wrap-before", "auth", "wrap-after"]);
  });

  test("applies CORS outside wrapHandler so OPTIONS preflight skips inner logic", async () => {
    let innerCalled = false;

    const handler = composeAuthRouteHandler(
      async () => {
        innerCalled = true;
        return new Response("ok");
      },
      {
        wrapHandler: (next) => async (req) => {
          innerCalled = true;
          return next(req);
        },
        cors: { origins: "http://localhost:5173" },
      },
    );

    const response = await handler(
      new Request("http://127.0.0.1/auth/get-session", {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:5173" },
      }),
    );

    expect(response.status).toBe(204);
    expect(innerCalled).toBe(false);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:5173",
    );
  });
});
