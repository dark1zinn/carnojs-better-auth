import type { BetterAuthService } from '../better-auth.service.ts';
import type { AuthContext } from '../types.ts';

/** Better Auth default when `session.freshAge` is omitted. */
export const DEFAULT_SESSION_FRESH_AGE_SECONDS = 60 * 60 * 24;

export function getSessionFreshAgeSeconds(authService: BetterAuthService): number {
    const freshAge = authService.auth.options.session?.freshAge;
    return freshAge === undefined ? DEFAULT_SESSION_FRESH_AGE_SECONDS : freshAge;
}

/**
 * Mirrors Better Auth's `freshSessionMiddleware` check.
 * When `freshAge` is `0`, freshness checks are disabled.
 */
export function isSessionFresh(session: AuthContext, freshAgeSeconds: number): boolean {
    if (freshAgeSeconds === 0) {
        return true;
    }

    const createdAt = new Date(session.session.createdAt).getTime();
    const freshAgeMs = freshAgeSeconds * 1000;
    return Date.now() - createdAt < freshAgeMs;
}
