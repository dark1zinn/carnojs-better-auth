import { describe, expect, test } from 'bun:test';
import { Carno } from '@carno.js/core';
import { CarnoBetterAuth } from '../../src/entry.ts';
import { DEFAULT_AUTH_BASE_PATH } from '../../src/constants.ts';
import { createTestAuthOptions } from '../helpers/test-auth.ts';
import { withAuthApp } from '../helpers/test-app.ts';

describe('CarnoBetterAuth', () => {
    test('rejects registering CarnoBetterAuth twice on the same app', () => {
        const app = new Carno();
        const authOptions = createTestAuthOptions();

        app.use(CarnoBetterAuth(authOptions));

        expect(() => app.use(CarnoBetterAuth(authOptions))).toThrow(
            /already registered on this Carno app/,
        );
    });

    test('allows CarnoBetterAuth on separate app instances', () => {
        const authOptions = createTestAuthOptions();

        expect(() => {
            new Carno().use(CarnoBetterAuth(authOptions));
            new Carno().use(CarnoBetterAuth(authOptions));
        }).not.toThrow();
    });

    test('rejects basePath at the application root', () => {
        expect(() => CarnoBetterAuth({ ...createTestAuthOptions(), basePath: '/' })).toThrow(
            /Invalid basePath/,
        );

        expect(() => CarnoBetterAuth({ ...createTestAuthOptions(), basePath: '' })).toThrow(
            /Invalid basePath/,
        );
    });

    test('mounts Better Auth routes under /auth', async () => {
        await withAuthApp(async ({ harness }) => {
            const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);
            expect(response.status).not.toBe(404);
        });
    });

    test('forwards nested auth paths to Better Auth', async () => {
        await withAuthApp(async ({ harness }) => {
            const response = await harness.post(`${DEFAULT_AUTH_BASE_PATH}/sign-up/email`, {
                email: 'nested@example.com',
                password: 'password123',
                name: 'Nested Test',
            });

            expect(response.status).toBe(200);
        });
    });

    test('exposes BetterAuthService from the plugin export', async () => {
        await withAuthApp(async ({ harness, auth }) => {
            const service = harness.resolve(
                (await import('../../src/better-auth.service.ts')).BetterAuthService,
            );
            expect(service.auth).toBe(auth.auth);
            expect(typeof service.auth.handler).toBe('function');
        });
    });
});
