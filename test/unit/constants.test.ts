import { describe, expect, test } from 'bun:test';
import {
    assertSafeAuthBasePath,
    authWildcardPath,
    DEFAULT_AUTH_BASE_PATH,
    isAuthPath,
    normalizeAuthBasePath,
    resolveAuthOptions,
} from '../../src/constants.ts';

describe('auth path helpers', () => {
    test('resolveAuthOptions defaults basePath to /auth', () => {
        expect(resolveAuthOptions({} as never).basePath).toBe('/auth');
        expect(resolveAuthOptions({ basePath: '/custom' } as never).basePath).toBe('/custom');
    });

    test('normalizeAuthBasePath trims trailing slashes', () => {
        expect(normalizeAuthBasePath('/auth/')).toBe('/auth');
        expect(normalizeAuthBasePath('auth')).toBe('/auth');
    });

    test('isAuthPath matches base and nested auth routes', () => {
        expect(isAuthPath('/auth', '/auth')).toBe(true);
        expect(isAuthPath('/auth/get-session', '/auth')).toBe(true);
        expect(isAuthPath('/auth/sign-up/email', '/auth')).toBe(true);
        expect(isAuthPath('/api/auth', '/auth')).toBe(false);
        expect(DEFAULT_AUTH_BASE_PATH).toBe('/auth');
    });

    test('authWildcardPath uses Bun single-segment wildcard routes', () => {
        expect(authWildcardPath('/auth')).toBe('/auth/*');
        expect(authWildcardPath('/api/auth')).toBe('/api/auth/*');
    });

    test('assertSafeAuthBasePath rejects the application root', () => {
        expect(() => assertSafeAuthBasePath('/')).toThrow(/Invalid basePath/);
        expect(() => assertSafeAuthBasePath('')).toThrow(/Invalid basePath/);
        expect(() => assertSafeAuthBasePath('/')).toThrow(/application root/);
    });

    test('assertSafeAuthBasePath accepts dedicated auth paths', () => {
        expect(assertSafeAuthBasePath('/auth')).toBe('/auth');
        expect(assertSafeAuthBasePath('/api/auth')).toBe('/api/auth');
        expect(assertSafeAuthBasePath('api/auth/')).toBe('/api/auth');
    });
});
