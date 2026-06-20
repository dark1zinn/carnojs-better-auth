import { Controller, Delete, Get, Head, Patch, Post, Put, Req } from '@carno.js/core';
import { BetterAuthService } from '../better-auth.service.ts';
import type { AuthRouteHandler, AuthRouteHandlerWrapper } from '../types/auth-route-handler.ts';

export type CreateBetterAuthControllerOptions = {
    wrapHandler?: AuthRouteHandlerWrapper;
};

function resolveAuthHandler(
    authService: BetterAuthService,
    wrapHandler?: AuthRouteHandlerWrapper,
): AuthRouteHandler {
    const baseHandler: AuthRouteHandler = (req) => authService.auth.handler(req);
    return wrapHandler ? wrapHandler(baseHandler) : baseHandler;
}

/**
 * Builds a Carno controller that forwards `/basePath` and `/basePath/*` to Better Auth.
 * Compiled on the host app so CORS and middleware apply natively.
 */
export function createBetterAuthController(
    basePath: string,
    options: CreateBetterAuthControllerOptions = {},
) {
    const { wrapHandler } = options;

    @Controller(basePath)
    class BetterAuthRoutesController {
        private readonly authHandler: AuthRouteHandler;

        constructor(authService: BetterAuthService) {
            this.authHandler = resolveAuthHandler(authService, wrapHandler);
        }

        @Get('/*')
        @Post('/*')
        @Put('/*')
        @Patch('/*')
        @Delete('/*')
        @Head('/*')
        async handleWildcard(@Req() req: Request): Promise<Response> {
            return this.authHandler(req);
        }

        @Get('')
        @Post('')
        @Put('')
        @Patch('')
        @Delete('')
        @Head('')
        async handleExact(@Req() req: Request): Promise<Response> {
            return this.authHandler(req);
        }
    }

    return BetterAuthRoutesController;
}
