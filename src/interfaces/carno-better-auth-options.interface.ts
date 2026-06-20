import type { BetterAuthModuleOptions } from "./better-auth-module-options.interface.ts";
import type { AuthRouteHandlerWrapper } from "../types/auth-route-handler.ts";

/** Options accepted by {@link CarnoBetterAuth}. */
export type CarnoBetterAuthOptions = BetterAuthModuleOptions & {
  /**
   * Wrap the Better Auth route handler at the raw `Request → Response` layer.
   * Prefer Carno middleware (`app.middlewares`, `@Middleware`) for cross-cutting
   * concerns; use this only when you need to intercept before Better Auth runs.
   */
  wrapHandler?: AuthRouteHandlerWrapper;
};
