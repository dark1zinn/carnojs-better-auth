import { isAPIError } from 'better-auth/api';
import { ServiceUnavailableException } from '@carno.js/core';
import type { BetterAuthService } from '../better-auth.service.ts';
import type { AuthContext } from '../types.ts';
import {
    apiErrorToResponse,
    AUTH_UNAVAILABLE_MESSAGE,
    unauthorizedResponse,
} from './auth-api-error.ts';

export { AUTH_UNAVAILABLE_MESSAGE } from './auth-api-error.ts';
export { UNAUTHORIZED_ERROR_CODE, UNAUTHORIZED_ERROR_MESSAGE } from './auth-api-error.ts';

function isAuthError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const status =
        'status' in error
            ? (error as { status: unknown }).status
            : 'statusCode' in error
              ? (error as { statusCode: unknown }).statusCode
              : undefined;

    return status === 401 || status === 403;
}

export type ProtectedSessionResult =
    | { ok: true; session: AuthContext }
    | { ok: false; response: Response };

export async function resolveProtectedSession(
    authService: BetterAuthService,
    headers: Headers,
): Promise<ProtectedSessionResult> {
    try {
        const session = await authService.auth.api.getSession({ headers });

        if (!session) {
            return { ok: false, response: unauthorizedResponse() };
        }

        return { ok: true, session };
    } catch (error) {
        if (isAPIError(error)) {
            return { ok: false, response: apiErrorToResponse(error) };
        }

        if (isAuthError(error)) {
            return { ok: false, response: unauthorizedResponse() };
        }

        console.error('[BetterAuthMiddleware] Session lookup failed:', error);
        throw new ServiceUnavailableException(AUTH_UNAVAILABLE_MESSAGE);
    }
}
