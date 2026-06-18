import { Carno } from "@carno.js/core";
import { BetterAuthConfig } from "./better-auth.config.ts";
import { DEFAULT_AUTH_BASE_PATH, assertSafeAuthBasePath } from "./constants.ts";
import type { BetterAuthModuleOptions } from "./interfaces/better-auth-module-options.interface.ts";
import { BetterAuthMiddleware } from "./middleware/better-auth.middleware.ts";
import { registerAuthRoutes } from "./routes/register-auth-routes.ts";
import { BetterAuthService } from "./better-auth.service.ts";

/**
 * Carno plugin that mounts Better Auth at `/auth/*` by default.
 * Prefix the whole app (e.g. nested controllers at `/api`) to change the public URL.
 */
export function CarnoBetterAuth(options: BetterAuthModuleOptions = {}) {
  const config = new BetterAuthConfig(options);
  const basePath = assertSafeAuthBasePath(
    config.options.basePath ?? DEFAULT_AUTH_BASE_PATH,
  );

  const plugin = new Carno({
    exports: [BetterAuthService, BetterAuthMiddleware],
  });

  plugin.services([
    { token: BetterAuthConfig, useValue: config },
    BetterAuthService,
    BetterAuthMiddleware,
  ]);

  registerAuthRoutes(plugin, basePath, (req) => config.auth.handler(req));

  return plugin;
}
