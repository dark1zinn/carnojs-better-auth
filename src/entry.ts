import { Carno } from '@carno.js/core';
import { BetterAuthConfig } from './better-auth.config.ts';
import { ensureBetterAuthUseGuard, markBetterAuthPlugin } from './better-auth.plugin-marker.ts';
import { DEFAULT_AUTH_BASE_PATH, assertSafeAuthBasePath } from './constants.ts';
import { createBetterAuthController } from './controllers/create-better-auth-controller.ts';
import type { CarnoBetterAuthOptions } from './interfaces/carno-better-auth-options.interface.ts';
import { BetterAuthMiddlewareConfig } from './middleware/better-auth-middleware.config.ts';
import { BetterAuthMiddleware } from './middleware/better-auth.middleware.ts';
import { BetterAuthService } from './better-auth.service.ts';

ensureBetterAuthUseGuard();

/**
 * Carno plugin that mounts Better Auth at `/auth/*` by default.
 * Prefix the whole app (e.g. nested controllers at `/api`) to change the public URL.
 */
export function CarnoBetterAuth(options: CarnoBetterAuthOptions = {}) {
    const {
        wrapHandler,
        middleware: middlewareOptions,
        skipValidation,
        strict,
        ...authOptions
    } = options;
    const config = new BetterAuthConfig(authOptions, { skipValidation, strict });
    const middlewareConfig = new BetterAuthMiddlewareConfig(middlewareOptions);
    const basePath = assertSafeAuthBasePath(config.options.basePath ?? DEFAULT_AUTH_BASE_PATH);

    const AuthController = createBetterAuthController(basePath, { wrapHandler });

    const plugin = new Carno({
        exports: [BetterAuthService, BetterAuthMiddleware],
    });

    plugin.services([
        { token: BetterAuthConfig, useValue: config },
        { token: BetterAuthMiddlewareConfig, useValue: middlewareConfig },
        BetterAuthService,
        BetterAuthMiddleware,
    ]);

    plugin.controllers([AuthController]);

    return markBetterAuthPlugin(plugin);
}
