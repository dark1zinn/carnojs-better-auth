import type { CorsConfig } from "@carno.js/core";
import type {
  AuthRouteHandler,
  AuthRouteHandlerWrapper,
} from "../types/auth-route-handler.ts";
import { wrapAuthHandlerWithCors } from "./cors-auth-handler.ts";

export type ComposeAuthHandlerOptions = {
  wrapHandler?: AuthRouteHandlerWrapper;
  cors?: CorsConfig;
};

/**
 * Builds the final `/auth/*` route handler.
 * User `wrapHandler` runs around Better Auth; CORS wraps outermost so
 * `OPTIONS` preflight is handled before inner logic.
 */
export function composeAuthRouteHandler(
  handler: AuthRouteHandler,
  options: ComposeAuthHandlerOptions = {},
): AuthRouteHandler {
  let composed = handler;

  if (options.wrapHandler) {
    composed = options.wrapHandler(composed);
  }

  if (options.cors) {
    composed = wrapAuthHandlerWithCors(composed, options.cors);
  }

  return composed;
}
