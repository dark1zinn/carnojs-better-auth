import { describe, expect, test } from 'bun:test';
import { Controller, Get, Locals, Middleware, withTestApp } from '@carno.js/core';
import { AUTH_USER_KEY } from '../../src/constants.ts';
import { BetterAuthService } from '../../src/better-auth.service.ts';
import {
    AUTH_UNAVAILABLE_MESSAGE,
    UNAUTHORIZED_ERROR_CODE,
    UNAUTHORIZED_ERROR_MESSAGE,
} from '../../src/middleware/resolve-protected-session.ts';
import { BetterAuthMiddleware } from '../../src/middleware/better-auth.middleware.ts';
import { withAuthApp } from '../helpers/test-app.ts';
import { readJson } from '../helpers/response.ts';

type ProfileBody = { authenticated: boolean; email: string };

@Controller('/profile')
@Middleware(BetterAuthMiddleware)
class ProfileController {
    @Get()
    profile(@Locals(AUTH_USER_KEY) user: { email: string }) {
        return { authenticated: true, email: user.email };
    }
}

describe('BetterAuthMiddleware', () => {
    test('returns 401 when no session is present', async () => {
        await withAuthApp(
            async ({ harness }) => {
                const response = await harness.get('/profile');
                const body = await readJson<{ code: string; message: string }>(response);

                expect(response.status).toBe(401);
                expect(body.code).toBe(UNAUTHORIZED_ERROR_CODE);
                expect(body.message).toBe(UNAUTHORIZED_ERROR_MESSAGE);
            },
            { controllers: [ProfileController], services: [BetterAuthMiddleware] },
        );
    });

    test('allows access and exposes the user via locals when authenticated', async () => {
        await withAuthApp(
            async ({ harness, test }) => {
                const user = test.createUser({ email: 'protected@example.com' });
                await test.saveUser(user);
                const { headers } = await test.login({ userId: user.id });

                const response = await harness.get('/profile', { headers });
                const body = await readJson<ProfileBody>(response);

                expect(response.status).toBe(200);
                expect(body.authenticated).toBe(true);
                expect(body.email).toBe('protected@example.com');
            },
            { controllers: [ProfileController], services: [BetterAuthMiddleware] },
        );
    });

    test('returns 503 when getSession throws an unexpected error', async () => {
        await withTestApp(
            async (harness) => {
                const response = await harness.get('/profile');
                const body = await readJson<{ statusCode: number; message: string }>(response);

                expect(response.status).toBe(503);
                expect(body.statusCode).toBe(503);
                expect(body.message).toBe(AUTH_UNAVAILABLE_MESSAGE);
            },
            {
                listen: true,
                controllers: [ProfileController],
                services: [
                    {
                        token: BetterAuthService,
                        useValue: {
                            auth: {
                                api: {
                                    getSession: async () => {
                                        throw new Error('Database connection failed');
                                    },
                                },
                            },
                        },
                    },
                    BetterAuthMiddleware,
                ],
            },
        );
    });

    test('returns 401 when getSession throws an auth-layer error', async () => {
        await withTestApp(
            async (harness) => {
                const response = await harness.get('/profile');
                const body = await readJson<{ code: string; message: string }>(response);

                expect(response.status).toBe(401);
                expect(body.code).toBe(UNAUTHORIZED_ERROR_CODE);
                expect(body.message).toBe(UNAUTHORIZED_ERROR_MESSAGE);
            },
            {
                listen: true,
                controllers: [ProfileController],
                services: [
                    {
                        token: BetterAuthService,
                        useValue: {
                            auth: {
                                api: {
                                    getSession: async () => {
                                        throw { status: 403, message: 'Invalid session token' };
                                    },
                                },
                            },
                        },
                    },
                    BetterAuthMiddleware,
                ],
            },
        );
    });
});
