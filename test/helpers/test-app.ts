import {
  type TestHarness,
  type TestOptions,
  withTestApp,
} from "@carno.js/core";
import type { TestHelpers } from "better-auth/plugins";
import { BetterAuthService } from "../../src/better-auth.service.ts";
import { CarnoBetterAuth } from "../../src/entry.ts";
import type { BetterAuthModuleOptions } from "../../src/interfaces/better-auth-module-options.interface.ts";
import { createTestAuthOptions } from "./test-auth.ts";

export type AuthTestContext = {
  harness: TestHarness;
  auth: BetterAuthService;
  test: TestHelpers;
};

export type AuthTestOptions = Omit<TestOptions, "plugins" | "listen"> & {
  authOptions?: BetterAuthModuleOptions;
};

async function resolveTestHelpers(
  auth: BetterAuthService,
): Promise<TestHelpers> {
  const ctx = await auth.auth.$context;
  return (ctx as typeof ctx & { test: TestHelpers }).test;
}

export async function withAuthApp(
  routine: (context: AuthTestContext) => Promise<void>,
  options: AuthTestOptions = {},
): Promise<void> {
  const { authOptions = createTestAuthOptions(), ...harnessOptions } = options;

  await withTestApp(
    async (harness) => {
      const auth = harness.resolve(BetterAuthService);
      const test = await resolveTestHelpers(auth);

      await routine({ harness, auth, test });
    },
    {
      ...harnessOptions,
      plugins: [CarnoBetterAuth(authOptions)],
      listen: true,
    },
  );
}
