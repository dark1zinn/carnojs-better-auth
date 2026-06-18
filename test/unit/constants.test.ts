import { describe, expect, test } from "bun:test";
import {
  AUTH_SESSION_KEY,
  AUTH_USER_KEY,
  BETTER_AUTH_OPTIONS,
  DEFAULT_AUTH_BASE_PATH,
} from "../../src/constants.ts";

describe("constants", () => {
  test("BETTER_AUTH_OPTIONS is a unique symbol", () => {
    expect(typeof BETTER_AUTH_OPTIONS).toBe("symbol");
    expect(BETTER_AUTH_OPTIONS.description).toBe("BETTER_AUTH_OPTIONS");
    expect(Symbol("BETTER_AUTH_OPTIONS")).not.toBe(BETTER_AUTH_OPTIONS);
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
