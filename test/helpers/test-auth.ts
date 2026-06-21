import { memoryAdapter } from 'better-auth/adapters/memory';
import { testUtils } from 'better-auth/plugins';
import type { BetterAuthModuleOptions } from '../../src/interfaces/better-auth-module-options.interface.ts';

/** Secret long enough to satisfy Carno-side validation in tests. */
export const TEST_AUTH_SECRET = 'carnojs-better-auth-test-secret-32chars';

/** Empty in-memory tables required by Better Auth's memory adapter. */
function createTestMemoryDatabase() {
    return memoryAdapter({
        user: [],
        session: [],
        account: [],
        verification: [],
    });
}

export function createTestAuthOptions(): BetterAuthModuleOptions {
    return {
        baseURL: 'http://127.0.0.1:3000',
        secret: TEST_AUTH_SECRET,
        database: createTestMemoryDatabase(),
        emailAndPassword: { enabled: true },
        plugins: [testUtils()],
    };
}
