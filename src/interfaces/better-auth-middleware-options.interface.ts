/** Options for {@link BetterAuthMiddleware} and {@link createBetterAuthMiddleware}. */
export type BetterAuthMiddlewareOptions = {
    /**
     * When `true` (default), reject sessions older than Better Auth's `session.freshAge`.
     * Set to `false` to only verify that a session exists.
     *
     * @see https://www.better-auth.com/docs/concepts/session-management
     */
    requireFreshSession?: boolean;
};
