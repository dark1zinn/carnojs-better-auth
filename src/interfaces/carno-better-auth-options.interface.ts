import type { CorsConfig } from "@carno.js/core";
import type { BetterAuthModuleOptions } from "./better-auth-module-options.interface.ts";
import type { AuthRouteHandlerWrapper } from "../types/auth-route-handler.ts";

/** Options accepted by {@link CarnoBetterAuth}. */
export type CarnoBetterAuthOptions = BetterAuthModuleOptions & {
  /**
   * Mirror the host Carno app's `cors` config so programmatic `/auth/*`
   * routes receive the same `Access-Control-*` headers as controller routes.
   */
  cors?: CorsConfig;
  /**
   * Wrap the Better Auth route handler (for logging, rate limits, request IDs).
   * Auth routes are raw `Request → Response` handlers and do not run Carno
   * controller middleware; use this to apply cross-cutting logic to `/auth/*`.
   */
  wrapHandler?: AuthRouteHandlerWrapper;
};
