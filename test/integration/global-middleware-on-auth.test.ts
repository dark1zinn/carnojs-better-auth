import { describe, expect, test } from 'bun:test';
import type { CarnoClosure, CarnoMiddleware, Context } from '@carno.js/core';
import { DEFAULT_AUTH_BASE_PATH } from '../../src/constants.ts';
import { createTestAuthOptions } from '../helpers/test-auth.ts';
import { withAuthApp } from '../helpers/test-app.ts';

const testGlobalMiddleware: CarnoMiddleware = {
    async handle(_ctx: Context, next: CarnoClosure): Promise<Response> {
        const response = await next();
        const headers = new Headers(response.headers);
        headers.set('x-global-mw', '1');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    },
};

describe('global middleware on auth routes', () => {
    test('host globalMiddlewares run on /auth/* via the Carno controller pipeline', async () => {
        await withAuthApp(
            async ({ harness }) => {
                const response = await harness.get(`${DEFAULT_AUTH_BASE_PATH}/get-session`);

                expect(response.headers.get('x-global-mw')).toBe('1');
            },
            {
                authOptions: createTestAuthOptions(),
                config: {
                    globalMiddlewares: [testGlobalMiddleware],
                },
            },
        );
    });
});
