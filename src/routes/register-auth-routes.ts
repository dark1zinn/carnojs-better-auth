import type { Carno } from "@carno.js/core";
import { AUTH_HTTP_METHODS, authWildcardPath } from "../constants.ts";

export function registerAuthRoutes(
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
