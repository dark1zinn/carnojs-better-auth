import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    AUTH_SESSION_KEY,
    AUTH_USER_KEY,
    BetterAuthConfig,
    BetterAuthMiddleware,
    BetterAuthService,
    CarnoBetterAuth,
    DEFAULT_AUTH_BASE_PATH,
} from '../../src/index.ts';

describe('public exports', () => {
    test('barrel re-exports the Carno plugin factory and core symbols', () => {
        expect(typeof CarnoBetterAuth).toBe('function');
        expect(BetterAuthService).toBeDefined();
        expect(BetterAuthMiddleware).toBeDefined();
        expect(BetterAuthConfig).toBeDefined();
        expect(AUTH_USER_KEY).toBe('authUser');
        expect(AUTH_SESSION_KEY).toBe('authSession');
        expect(DEFAULT_AUTH_BASE_PATH).toBe('/auth');
    });

    test('package.json exports map points at dist entry files', () => {
        const packageJsonPath = resolve(import.meta.dir, '../../package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
            main: string;
            module: string;
            types: string;
            exports: {
                '.': {
                    types: string;
                    import: string;
                };
            };
        };

        expect(packageJson.main).toBe('./dist/index.mjs');
        expect(packageJson.module).toBe('./dist/index.mjs');
        expect(packageJson.types).toBe('./dist/index.d.mts');
        expect(packageJson.exports['.'].import).toBe('./dist/index.mjs');
        expect(packageJson.exports['.'].types).toBe('./dist/index.d.mts');

        const distDir = resolve(import.meta.dir, '../../dist');
        expect(existsSync(resolve(distDir, 'index.mjs'))).toBe(true);
        expect(existsSync(resolve(distDir, 'index.d.mts'))).toBe(true);
    });
});
