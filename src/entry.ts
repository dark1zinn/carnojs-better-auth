import { Carno } from "@carno.js/core";
import { BetterAuthConfig } from "./better-auth.config.ts";
import { DEFAULT_AUTH_BASE_PATH, assertSafeAuthBasePath } from "./constants.ts";
import type { CarnoBetterAuthOptions } from "./interfaces/carno-better-auth-options.interface.ts";
import { BetterAuthMiddleware } from "./middleware/better-auth.middleware.ts";
import { composeAuthRouteHandler } from "./routes/compose-auth-handler.ts";
import { registerAuthRoutes } from "./routes/register-auth-routes.ts";
import { BetterAuthService } from "./better-auth.service.ts";

/**
 * Carno plugin that mounts Better Auth at `/auth/*` by default.
 * Prefix the whole app (e.g. nested controllers at `/api`) to change the public URL.
 */
export function CarnoBetterAuth(options: CarnoBetterAuthOptions = {}) {
  const { cors, wrapHandler, ...authOptions } = options;
  const config = new BetterAuthConfig(authOptions);
  const basePath = assertSafeAuthBasePath(
    config.options.basePath ?? DEFAULT_AUTH_BASE_PATH,
  );

  const plugin = new Carno({
    exports: [BetterAuthService, BetterAuthMiddleware],
    cors,
  });

  plugin.services([
    { token: BetterAuthConfig, useValue: config },
    BetterAuthService,
    BetterAuthMiddleware,
  ]);

  const authHandler = composeAuthRouteHandler(
    (req) => config.auth.handler(req),
    { wrapHandler, cors },
  );

  registerAuthRoutes(plugin, basePath, authHandler);

  return plugin;
}
