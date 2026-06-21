import { Service, type CarnoClosure, type CarnoMiddleware, type Context } from '@carno.js/core';
import { BetterAuthService } from '../better-auth.service.ts';
import { AUTH_SESSION_KEY, AUTH_USER_KEY } from '../constants.ts';
import type { BetterAuthMiddlewareOptions } from '../interfaces/better-auth-middleware-options.interface.ts';
import { BetterAuthMiddlewareConfig } from './better-auth-middleware.config.ts';
import { resolveProtectedSession } from './resolve-protected-session.ts';

async function applyProtectedSession(
    authService: BetterAuthService,
    ctx: Context,
    next: CarnoClosure,
    options: BetterAuthMiddlewareOptions,
): Promise<Response | void> {
    const result = await resolveProtectedSession(authService, ctx.headers, options);

    if (!result.ok) {
        return result.response;
    }

    ctx.locals[AUTH_USER_KEY] = result.session.user;
    ctx.locals[AUTH_SESSION_KEY] = result.session.session;
    await next();
}

@Service()
export class BetterAuthMiddleware implements CarnoMiddleware {
    constructor(
        private readonly authService: BetterAuthService,
        private readonly config: BetterAuthMiddlewareConfig,
    ) {}

    // fallow-ignore-next-line unused-class-member
    async handle(ctx: Context, next: CarnoClosure): Promise<Response | void> {
        return applyProtectedSession(this.authService, ctx, next, this.config.options);
    }
}

/** Per-controller middleware with explicit freshness or other options. */
export function createBetterAuthMiddleware(
    options: BetterAuthMiddlewareOptions = {},
): new (authService: BetterAuthService) => CarnoMiddleware {
    @Service()
    class ConfiguredBetterAuthMiddleware implements CarnoMiddleware {
        constructor(private readonly authService: BetterAuthService) {}

        // fallow-ignore-next-line unused-class-member
        async handle(ctx: Context, next: CarnoClosure): Promise<Response | void> {
            return applyProtectedSession(this.authService, ctx, next, options);
        }
    }

    return ConfiguredBetterAuthMiddleware;
}
