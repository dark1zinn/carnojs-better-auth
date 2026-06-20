export { CarnoBetterAuth } from "./entry.ts";

export { buildAuthClientBaseURL } from "./auth-url.ts";
export { BetterAuthService } from "./better-auth.service.ts";
export { BetterAuthMiddleware } from "./middleware/better-auth.middleware.ts";
export { BetterAuthConfig } from "./better-auth.config.ts";

export {
  AUTH_SESSION_KEY,
  AUTH_USER_KEY,
  DEFAULT_AUTH_BASE_PATH,
} from "./constants.ts";

export type { BetterAuthModuleOptions } from "./interfaces/better-auth-module-options.interface.ts";
export type { CarnoBetterAuthOptions } from "./interfaces/carno-better-auth-options.interface.ts";
export type {
  AuthRouteHandler,
  AuthRouteHandlerWrapper,
} from "./types/auth-route-handler.ts";
export type { AuthContext, AuthLocals } from "./types.ts";
