import type { BetterAuthMiddlewareOptions } from '../interfaces/better-auth-middleware-options.interface.ts';

/** Plugin-level defaults for {@link BetterAuthMiddleware}. */
export class BetterAuthMiddlewareConfig {
    constructor(public readonly options: BetterAuthMiddlewareOptions = {}) {}
}
