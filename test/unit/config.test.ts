import { afterEach, describe, expect, test } from 'bun:test';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { BetterAuthConfig } from '../../src/better-auth.config.ts';
import { TEST_AUTH_SECRET } from '../helpers/test-auth.ts';

describe('BetterAuthConfig', () => {
    afterEach(() => {
        console.warn = console.warn.bind(console);
    });

    test('creates a shared auth instance with resolved options', () => {
        const config = new BetterAuthConfig({
            basePath: '/auth',
            baseURL: 'http://localhost:3000',
            secret: TEST_AUTH_SECRET,
            database: memoryAdapter({}),
            emailAndPassword: { enabled: true },
        });

        expect(config.auth).toBeDefined();
        expect(typeof config.auth.handler).toBe('function');
        expect(config.options.basePath).toBe('/auth');
    });

    test('warns when baseURL path does not match basePath', () => {
        const calls: unknown[][] = [];
        const original = console.warn;
        console.warn = (...args: unknown[]) => {
            calls.push(args);
        };

        new BetterAuthConfig({
            baseURL: 'http://localhost:3000/api/auth',
            basePath: '/auth',
            secret: TEST_AUTH_SECRET,
            database: memoryAdapter({}),
            emailAndPassword: { enabled: true },
        });

        console.warn = original;
        expect(calls.length).toBeGreaterThan(0);
        expect(String(calls[0]?.[0])).toContain('does not match basePath');
    });
});
