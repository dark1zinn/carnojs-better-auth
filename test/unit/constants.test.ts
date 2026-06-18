import { describe, expect, test } from "bun:test";
import {
  AUTH_SESSION_KEY,
  AUTH_USER_KEY,
  BetterAuthConfig,
  DEFAULT_AUTH_BASE_PATH,
} from "../../src/constants.ts";

describe("constants", () => {
  test("BetterAuthConfig is a distinct DI token class", () => {
    expect(typeof BetterAuthConfig).toBe("function");
    expect(new BetterAuthConfig({} as never)).toBeInstanceOf(BetterAuthConfig);
  });

  test("locals keys are stable string identifiers", () => {
    expect(AUTH_USER_KEY).toBe("authUser");
    expect(AUTH_SESSION_KEY).toBe("authSession");
    expect(AUTH_USER_KEY).not.toBe(AUTH_SESSION_KEY);
  });

  test("default auth base path is /auth without an api prefix", () => {
    expect(DEFAULT_AUTH_BASE_PATH).toBe("/auth");
    expect(DEFAULT_AUTH_BASE_PATH.startsWith("/api")).toBe(false);
  });
});
