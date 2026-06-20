import { afterEach, describe, expect, test } from 'bun:test';
import { buildAuthClientBaseURL, warnOnBaseUrlBasePathMismatch } from '../../src/auth-url.ts';
import { DEFAULT_AUTH_BASE_PATH } from '../../src/constants.ts';

describe('auth URL helpers', () => {
    const warnSpy = () => {
        const original = console.warn;
        const calls: unknown[][] = [];

        console.warn = (...args: unknown[]) => {
            calls.push(args);
        };

        return {
            calls,
            restore: () => {
                console.warn = original;
            },
        };
    };

    afterEach(() => {
        console.warn = console.warn.bind(console);
    });

    test('buildAuthClientBaseURL appends the auth base path to the app origin', () => {
        expect(buildAuthClientBaseURL('http://localhost:3000', DEFAULT_AUTH_BASE_PATH)).toBe(
            'http://localhost:3000/auth',
        );

        expect(buildAuthClientBaseURL('http://localhost:3000/', '/api/auth')).toBe(
            'http://localhost:3000/api/auth',
        );
    });

    test('warnOnBaseUrlBasePathMismatch ignores origin-only server baseURL', () => {
        const spy = warnSpy();

        warnOnBaseUrlBasePathMismatch({
            baseURL: 'http://localhost:3000',
            basePath: DEFAULT_AUTH_BASE_PATH,
        });

        expect(spy.calls).toHaveLength(0);
        spy.restore();
    });

    test('warnOnBaseUrlBasePathMismatch warns when baseURL path disagrees with basePath', () => {
        const spy = warnSpy();

        warnOnBaseUrlBasePathMismatch({
            baseURL: 'http://localhost:3000/api/auth',
            basePath: DEFAULT_AUTH_BASE_PATH,
        });

        expect(spy.calls).toHaveLength(1);
        expect(String(spy.calls[0]?.[0])).toContain('does not match basePath');
        expect(String(spy.calls[0]?.[0])).toContain('http://localhost:3000/auth');
        spy.restore();
    });
});
