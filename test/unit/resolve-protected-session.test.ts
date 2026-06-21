import { describe, expect, test } from 'bun:test';
import { APIError } from 'better-auth/api';
import { BetterAuthService } from '../../src/better-auth.service.ts';
import {
    apiErrorToResponse,
    SESSION_NOT_FRESH_ERROR_CODE,
    SESSION_NOT_FRESH_ERROR_MESSAGE,
    sessionNotFreshResponse,
    UNAUTHORIZED_ERROR_CODE,
    UNAUTHORIZED_ERROR_MESSAGE,
    unauthorizedResponse,
} from '../../src/middleware/auth-api-error.ts';
import { resolveProtectedSession } from '../../src/middleware/resolve-protected-session.ts';

function createAuthService(
    getSession: () => Promise<unknown>,
    sessionOptions?: { freshAge?: number },
): BetterAuthService {
    return {
        auth: {
            options: { session: sessionOptions },
            api: { getSession },
        },
    } as BetterAuthService;
}

function createValidSession(createdAt = new Date()) {
    return {
        session: {
            id: 'session-1',
            userId: 'user-1',
            createdAt,
            expiresAt: new Date(Date.now() + 60_000),
            token: 'token',
            updatedAt: createdAt,
        },
        user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
            emailVerified: true,
            createdAt,
            updatedAt: createdAt,
        },
    };
}

describe('auth API error responses', () => {
    test('unauthorizedResponse matches Better Auth APIError JSON shape', async () => {
        const response = unauthorizedResponse();

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            code: UNAUTHORIZED_ERROR_CODE,
            message: UNAUTHORIZED_ERROR_MESSAGE,
        });
    });

    test('apiErrorToResponse preserves Better Auth error bodies', async () => {
        const error = new APIError('UNAUTHORIZED', {
            code: 'INVALID_TOKEN',
            message: 'Invalid token',
        });
        const response = apiErrorToResponse(error);

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            code: 'INVALID_TOKEN',
            message: 'Invalid token',
        });
    });

    test('sessionNotFreshResponse matches Better Auth APIError JSON shape', async () => {
        const response = sessionNotFreshResponse();

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
            code: SESSION_NOT_FRESH_ERROR_CODE,
            message: SESSION_NOT_FRESH_ERROR_MESSAGE,
        });
    });
});

describe('resolveProtectedSession', () => {
    test('returns unauthorized when getSession resolves to null', async () => {
        const result = await resolveProtectedSession(
            createAuthService(async () => null),
            new Headers(),
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.response.status).toBe(401);
            expect(await result.response.json()).toEqual({
                code: UNAUTHORIZED_ERROR_CODE,
                message: UNAUTHORIZED_ERROR_MESSAGE,
            });
        }
    });

    test('returns unauthorized when getSession throws an auth error', async () => {
        const result = await resolveProtectedSession(
            createAuthService(async () => {
                throw { status: 401, message: 'Invalid session' };
            }),
            new Headers(),
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.response.status).toBe(401);
            expect(await result.response.json()).toEqual({
                code: UNAUTHORIZED_ERROR_CODE,
                message: UNAUTHORIZED_ERROR_MESSAGE,
            });
        }
    });

    test('preserves APIError bodies from getSession', async () => {
        const result = await resolveProtectedSession(
            createAuthService(async () => {
                throw new APIError('UNAUTHORIZED', {
                    code: 'SESSION_EXPIRED',
                    message: 'Session expired',
                });
            }),
            new Headers(),
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(await result.response.json()).toEqual({
                code: 'SESSION_EXPIRED',
                message: 'Session expired',
            });
        }
    });

    test('throws ServiceUnavailableException for unexpected failures', async () => {
        await expect(
            resolveProtectedSession(
                createAuthService(async () => {
                    throw new Error('Database connection failed');
                }),
                new Headers(),
            ),
        ).rejects.toMatchObject({
            statusCode: 503,
            message: 'Authentication service unavailable',
        });
    });

    test('returns SESSION_NOT_FRESH for stale sessions by default', async () => {
        const staleSession = createValidSession(new Date(Date.now() - 120_000));
        const result = await resolveProtectedSession(
            createAuthService(async () => staleSession, { freshAge: 60 }),
            new Headers(),
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.response.status).toBe(403);
            expect(await result.response.json()).toEqual({
                code: SESSION_NOT_FRESH_ERROR_CODE,
                message: SESSION_NOT_FRESH_ERROR_MESSAGE,
            });
        }
    });

    test('returns session when requireFreshSession is false and session is stale', async () => {
        const staleSession = createValidSession(new Date(Date.now() - 120_000));
        const result = await resolveProtectedSession(
            createAuthService(async () => staleSession, { freshAge: 60 }),
            new Headers(),
            { requireFreshSession: false },
        );

        expect(result.ok).toBe(true);
    });

    test('returns session when session is fresh', async () => {
        const freshSession = createValidSession(new Date());
        const result = await resolveProtectedSession(
            createAuthService(async () => freshSession, { freshAge: 60 }),
            new Headers(),
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.session.user.email).toBe('user@example.com');
        }
    });
});
