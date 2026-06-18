import { memoryAdapter } from "better-auth/adapters/memory";
import { testUtils } from "better-auth/plugins";
import type { BetterAuthModuleOptions } from "../../src/interfaces/better-auth-module-options.interface.ts";

export function createTestAuthOptions(): BetterAuthModuleOptions {
  return {
    database: memoryAdapter({}),
    emailAndPassword: { enabled: true },
    plugins: [testUtils()],
  };
}
