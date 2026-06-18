import { describe, expect, test } from "bun:test";
import { memoryAdapter } from "better-auth/adapters/memory";
import { BetterAuthConfig } from "../../src/better-auth.config.ts";

describe("BetterAuthConfig", () => {
  test("creates a shared auth instance with resolved options", () => {
    const config = new BetterAuthConfig({
      basePath: "/auth",
      database: memoryAdapter({}),
      emailAndPassword: { enabled: true },
    });

    expect(config.auth).toBeDefined();
    expect(typeof config.auth.handler).toBe("function");
    expect(config.options.basePath).toBe("/auth");
  });
});
