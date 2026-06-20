import { APIError } from 'better-auth/api';

export const AUTH_UNAVAILABLE_MESSAGE = 'Authentication service unavailable';

export const UNAUTHORIZED_ERROR_CODE = 'UNAUTHORIZED';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Unauthorized';

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
