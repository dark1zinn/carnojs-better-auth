import { describe, expect, test } from 'bun:test';
import { Controller, Get, Locals, Middleware } from '@carno.js/core';
import { AUTH_USER_KEY } from '../../src/constants.ts';
import { BetterAuthMiddleware } from '../../src/middleware/better-auth.middleware.ts';
import { createTestAuthOptions } from '../helpers/test-auth.ts';
import { withAuthApp } from '../helpers/test-app.ts';
import { readJson } from '../helpers/response.ts';

const API_AUTH_BASE = '/api/auth';

type ApiMeBody = { email: string };

@Controller('/api/me')
@Middleware(BetterAuthMiddleware)
class ApiMeController {
    @Get()
    me(@Locals(AUTH_USER_KEY) user: { email: string }) {
        return { email: user.email };
    }
}

describe('prefixed API routes', () => {
    test('mounts Better Auth under a custom basePath', async () => {
        await withAuthApp(
            async ({ harness }) => {
                const response = await harness.get(`${API_AUTH_BASE}/get-session`);
                expect(response.status).not.toBe(404);
            },
            {
                authOptions: {
                    ...createTestAuthOptions(),
                    basePath: API_AUTH_BASE,
                },
            },
        );
    });

    test('protects a controller under the same /api prefix as auth', async () => {
        await withAuthApp(
            async ({ harness, test }) => {
                const email = 'api-prefix@example.com';
                const user = test.createUser({ email });
                await test.saveUser(user);
                const { headers } = await test.login({ userId: user.id });

                const response = await harness.get('/api/me', { headers });
                const body = await readJson<ApiMeBody>(response);

                expect(response.status).toBe(200);
                expect(body.email).toBe(email);
            },
            {
                authOptions: {
                    ...createTestAuthOptions(),
                    basePath: API_AUTH_BASE,
                },
                controllers: [ApiMeController],
                services: [BetterAuthMiddleware],
            },
        );
    });
});
