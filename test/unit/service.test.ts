import { afterEach, describe, expect, test } from "bun:test";
import { createTestHarness, type TestHarness } from "@carno.js/core";
import { BetterAuthConfig } from "../../src/better-auth.config.ts";
import { BetterAuthService } from "../../src/better-auth.service.ts";
import { DEFAULT_AUTH_BASE_PATH } from "../../src/constants.ts";
import { createTestAuthOptions } from "../helpers/test-auth.ts";

describe("BetterAuthService", () => {
  let harness: TestHarness;

  afterEach(async () => {
    await harness?.close();
  });

  test("resolves from the Carno container with injected options", async () => {
    const options = createTestAuthOptions();

    harness = await createTestHarness({
      listen: true,
      services: [
        { token: BetterAuthConfig, useValue: new BetterAuthConfig(options) },
        BetterAuthService,
      ],
    });

    const service = harness.resolve(BetterAuthService);

    expect(service).toBeInstanceOf(BetterAuthService);
    expect(service.auth).toBeDefined();
    expect(typeof service.auth.handler).toBe("function");
    expect(typeof service.auth.api.getSession).toBe("function");
  });

  test("auth.handler returns a Response for Better Auth routes", async () => {
    harness = await createTestHarness({
      listen: true,
      services: [
        {
          token: BetterAuthConfig,
          useValue: new BetterAuthConfig(createTestAuthOptions()),
        },
        BetterAuthService,
      ],
    });

    const service = harness.resolve(BetterAuthService);
    const response = await service.auth.handler(
      new Request(`http://127.0.0.1${DEFAULT_AUTH_BASE_PATH}/get-session`),
    );

    expect(response).toBeInstanceOf(Response);
  });
});
