import { describe, expect, test } from "bun:test";
import { memoryAdapter } from "better-auth/adapters/memory";
import {
  authWildcardPath,
  BetterAuthConfig,
  DEFAULT_AUTH_BASE_PATH,
  isAuthPath,
  normalizeAuthBasePath,
  resolveAuthOptions,
} from "../../src/constants.ts";

describe("constants", () => {
  test("BetterAuthConfig creates a shared auth instance", () => {
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

describe("auth path helpers", () => {
  test("resolveAuthOptions defaults basePath to /auth", () => {
    expect(resolveAuthOptions({} as never).basePath).toBe("/auth");
    expect(
      resolveAuthOptions({ basePath: "/custom" } as never).basePath,
    ).toBe("/custom");
  });

  test("normalizeAuthBasePath trims trailing slashes", () => {
    expect(normalizeAuthBasePath("/auth/")).toBe("/auth");
    expect(normalizeAuthBasePath("auth")).toBe("/auth");
  });

  test("isAuthPath matches base and nested auth routes", () => {
    expect(isAuthPath("/auth", "/auth")).toBe(true);
    expect(isAuthPath("/auth/get-session", "/auth")).toBe(true);
    expect(isAuthPath("/auth/sign-up/email", "/auth")).toBe(true);
    expect(isAuthPath("/api/auth", "/auth")).toBe(false);
    expect(DEFAULT_AUTH_BASE_PATH).toBe("/auth");
  });

  test("authWildcardPath uses Bun single-segment wildcard routes", () => {
    expect(authWildcardPath("/auth")).toBe("/auth/*");
  });
});
