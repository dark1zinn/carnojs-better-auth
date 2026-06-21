import { describe, expect, test } from 'bun:test';
import type { BetterAuthService } from '../../src/better-auth.service.ts';
import type { AuthContext } from '../../src/types.ts';
import {
    DEFAULT_SESSION_FRESH_AGE_SECONDS,
    getSessionFreshAgeSeconds,
    isSessionFresh,
} from '../../src/middleware/session-freshness.ts';

function createAuthService(session?: { freshAge?: number }): BetterAuthService {
    return {
        auth: {
            options: { session },
        },
    } as BetterAuthService;
}

function createSession(createdAt: Date): AuthContext {
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
            email: 'fresh@example.com',
            name: 'Fresh User',
            emailVerified: true,
            createdAt,
            updatedAt: createdAt,
        },
    };
}

describe('session freshness helpers', () => {
    test('getSessionFreshAgeSeconds uses Better Auth default when omitted', () => {
        expect(getSessionFreshAgeSeconds(createAuthService())).toBe(
            DEFAULT_SESSION_FRESH_AGE_SECONDS,
        );
    });

    test('getSessionFreshAgeSeconds reads configured freshAge', () => {
        expect(getSessionFreshAgeSeconds(createAuthService({ freshAge: 120 }))).toBe(120);
    });

    test('isSessionFresh accepts sessions within freshAge', () => {
        const session = createSession(new Date());
        expect(isSessionFresh(session, 60)).toBe(true);
    });

    test('isSessionFresh rejects sessions older than freshAge', () => {
        const session = createSession(new Date(Date.now() - 120_000));
        expect(isSessionFresh(session, 60)).toBe(false);
    });

    test('isSessionFresh treats freshAge 0 as always fresh', () => {
        const session = createSession(new Date(Date.now() - 120_000));
        expect(isSessionFresh(session, 0)).toBe(true);
    });
});
