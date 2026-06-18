import { Carno } from "@carno.js/core";
import type { BetterAuthOptions } from "better-auth";
import { BetterAuthService } from "./better-auth.service.ts";
import {
  AUTH_HTTP_METHODS,
  BetterAuthConfig,
  DEFAULT_AUTH_BASE_PATH,
  authWildcardPath,
  normalizeAuthBasePath,
  resolveAuthOptions,
} from "./constants.ts";

function registerAuthRoutes(
  plugin: Carno,
  basePath: string,
  handler: (req: Request) => Response | Promise<Response>,
): void {
  const wildcardPath = authWildcardPath(basePath);

  for (const method of AUTH_HTTP_METHODS) {
    plugin.route(method, wildcardPath, handler);

    if (basePath !== "/") {
      plugin.route(method, basePath, handler);
    }
  }
}

/**
 * Creates a Carno plugin that mounts Better Auth at `/auth/*` by default.
 * Prefix the whole app (e.g. nested controllers at `/api`) to change the public URL.
 */
export function createBetterAuthPlugin(
  options: BetterAuthOptions,
): Carno {
  const config = new BetterAuthConfig(resolveAuthOptions(options));
  const basePath = normalizeAuthBasePath(
    config.options.basePath ?? DEFAULT_AUTH_BASE_PATH,
  );

  const plugin = new Carno({
    exports: [BetterAuthService],
  });

  plugin.services([
    { token: BetterAuthConfig, useValue: config },
    BetterAuthService,
  ]);

  registerAuthRoutes(plugin, basePath, (req) => config.auth.handler(req));

  return plugin;
}

/** @deprecated Use {@link createBetterAuthPlugin} */
export const BetterAuthModule = createBetterAuthPlugin;
