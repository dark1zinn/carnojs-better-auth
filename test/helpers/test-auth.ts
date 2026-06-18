import { memoryAdapter } from "better-auth/adapters/memory";
import { testUtils } from "better-auth/plugins";
import type { BetterAuthModuleOptions } from "../../src/interfaces/better-auth-module-options.interface.ts";

/** Empty in-memory tables required by Better Auth's memory adapter. */
export function createTestMemoryDatabase() {
  return memoryAdapter({
    user: [],
    session: [],
    account: [],
    verification: [],
  });
}

export function createTestAuthOptions(): BetterAuthModuleOptions {
  return {
    baseURL: "http://127.0.0.1:3000",
    database: createTestMemoryDatabase(),
    emailAndPassword: { enabled: true },
    plugins: [testUtils()],
  };
}
