import { describe, expect, test } from 'bun:test';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { CarnoBetterAuth } from '../../src/entry.ts';
import { BetterAuthConfig } from '../../src/better-auth.config.ts';
import {
    AuthConfigValidationError,
    MIN_AUTH_SECRET_LENGTH,
    usesCookieBasedAuth,
    validateAuthOptions,
} from '../../src/validate-auth-options.ts';
import { TEST_AUTH_SECRET } from '../helpers/test-auth.ts';

const cookieAuthOptions = {
    baseURL: 'http://localhost:3000',
    secret: TEST_AUTH_SECRET,
    database: memoryAdapter({}),
    emailAndPassword: { enabled: true },
};

describe('usesCookieBasedAuth', () => {
    test('returns true when email and password is enabled', () => {
        expect(usesCookieBasedAuth({ emailAndPassword: { enabled: true } })).toBe(true);
    });

    test('returns true when a database adapter is configured', () => {
        expect(usesCookieBasedAuth({ database: memoryAdapter({}) })).toBe(true);
    });

    test('returns false for an empty options object', () => {
        expect(usesCookieBasedAuth({})).toBe(false);
    });
});

describe('validateAuthOptions', () => {
    test('throws when secret is missing for cookie-based auth', () => {
        expect(() =>
            validateAuthOptions(
                {
                    baseURL: 'http://localhost:3000',
                    database: memoryAdapter({}),
                    emailAndPassword: { enabled: true },
                },
                {},
            ),
        ).toThrow(AuthConfigValidationError);
    });

    test('throws when secret is shorter than the minimum length', () => {
        expect(() =>
            validateAuthOptions(
                {
                    ...cookieAuthOptions,
                    secret: 'too-short',
                },
                {},
            ),
        ).toThrow(/too short/);
    });

    test('throws when baseURL is missing for cookie-based auth', () => {
        expect(() =>
            validateAuthOptions(
                {
                    secret: TEST_AUTH_SECRET,
                    database: memoryAdapter({}),
                    emailAndPassword: { enabled: true },
                },
                {},
            ),
        ).toThrow(/Missing baseURL/);
    });

    test('accepts BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment', () => {
        expect(() =>
            validateAuthOptions(
                {
                    database: memoryAdapter({}),
                    emailAndPassword: { enabled: true },
                },
                {
                    BETTER_AUTH_SECRET: TEST_AUTH_SECRET,
                    BETTER_AUTH_URL: 'http://localhost:3000',
                },
            ),
        ).not.toThrow();
    });

    test('accepts dynamic baseURL with allowedHosts', () => {
        expect(() =>
            validateAuthOptions(
                {
                    secret: TEST_AUTH_SECRET,
                    database: memoryAdapter({}),
                    emailAndPassword: { enabled: true },
                    baseURL: { allowedHosts: ['localhost', '*.example.com'] },
                },
                {},
            ),
        ).not.toThrow();
    });

    test('skips validation when skipValidation is true', () => {
        expect(() => validateAuthOptions({}, {}, { skipValidation: true })).not.toThrow();
    });

    test('warns instead of throwing when strict is false', () => {
        const warnings: unknown[][] = [];
        const original = console.warn;
        console.warn = (...args: unknown[]) => {
            warnings.push(args);
        };

        validateAuthOptions(
            {
                database: memoryAdapter({}),
                emailAndPassword: { enabled: true },
            },
            {},
            { strict: false },
        );

        console.warn = original;
        expect(warnings.length).toBeGreaterThan(0);
        expect(String(warnings[0]?.[0])).toContain('[carnojs-better-auth]');
    });
});

describe('CarnoBetterAuth validation', () => {
    test('throws at plugin init when secret is missing', () => {
        expect(() =>
            CarnoBetterAuth({
                baseURL: 'http://localhost:3000',
                database: memoryAdapter({}),
                emailAndPassword: { enabled: true },
            }),
        ).toThrow(AuthConfigValidationError);
    });

    test('allows invalid production config when skipValidation is true', () => {
        expect(() =>
            CarnoBetterAuth({
                database: memoryAdapter({}),
                emailAndPassword: { enabled: true },
                skipValidation: true,
            }),
        ).not.toThrow();
    });
});

describe('BetterAuthConfig validation', () => {
    test('throws when constructed without required options', () => {
        expect(() => new BetterAuthConfig(cookieAuthOptions)).not.toThrow();
        expect(
            () =>
                new BetterAuthConfig({
                    baseURL: 'http://localhost:3000',
                    database: memoryAdapter({}),
                    emailAndPassword: { enabled: true },
                }),
        ).toThrow(AuthConfigValidationError);
    });
});

describe('validateAuthOptions constants', () => {
    test('MIN_AUTH_SECRET_LENGTH matches Better Auth guidance', () => {
        expect(MIN_AUTH_SECRET_LENGTH).toBe(32);
    });
});
