import { APIError } from 'better-auth/api';

export const AUTH_UNAVAILABLE_MESSAGE = 'Authentication service unavailable';

export const UNAUTHORIZED_ERROR_CODE = 'UNAUTHORIZED';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Unauthorized';

export const SESSION_NOT_FRESH_ERROR_CODE = 'SESSION_NOT_FRESH';
export const SESSION_NOT_FRESH_ERROR_MESSAGE = 'Session is not fresh';

function createUnauthorizedError(): APIError {
    return new APIError('UNAUTHORIZED', {
        code: UNAUTHORIZED_ERROR_CODE,
        message: UNAUTHORIZED_ERROR_MESSAGE,
    });
}

export function apiErrorToResponse(error: APIError): Response {
    return Response.json(error.body, {
        status: error.statusCode,
        headers: error.headers,
    });
}

export function unauthorizedResponse(): Response {
    return apiErrorToResponse(createUnauthorizedError());
}

export function sessionNotFreshResponse(): Response {
    return apiErrorToResponse(
        new APIError('FORBIDDEN', {
            code: SESSION_NOT_FRESH_ERROR_CODE,
            message: SESSION_NOT_FRESH_ERROR_MESSAGE,
        }),
    );
}
