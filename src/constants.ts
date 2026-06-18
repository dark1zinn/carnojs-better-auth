/** DI token for Better Auth configuration passed into the plugin factory. */
export const BETTER_AUTH_OPTIONS = Symbol("BETTER_AUTH_OPTIONS");

/** Default Better Auth HTTP base path mounted by the Carno plugin. */
export const DEFAULT_AUTH_BASE_PATH = "/auth";

/** `ctx.locals` key for the authenticated Better Auth user. */
export const AUTH_USER_KEY = "authUser";

/** `ctx.locals` key for the authenticated Better Auth session. */
export const AUTH_SESSION_KEY = "authSession";
