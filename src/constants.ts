import type { BetterAuthModuleOptions } from "./interfaces/better-auth-module-options.interface.ts";

/** Default Better Auth HTTP base path mounted by the Carno plugin. */
export const DEFAULT_AUTH_BASE_PATH = "/auth";

/** `ctx.locals` key for the authenticated Better Auth user. */
export const AUTH_USER_KEY = "authUser";

/** `ctx.locals` key for the authenticated Better Auth session. */
export const AUTH_SESSION_KEY = "authSession";

/** HTTP methods forwarded to Better Auth's catch-all handler. */
export const AUTH_HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] as const;

export function resolveAuthOptions(
  options: BetterAuthModuleOptions,
): BetterAuthModuleOptions {
  return {
    ...options,
    basePath: options.basePath ?? DEFAULT_AUTH_BASE_PATH,
  };
}

export function normalizeAuthBasePath(basePath: string): string {
  let normalized = basePath.startsWith("/") ? basePath : `/${basePath}`;

  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/** Rejects base paths that would register a catch-all `/*` auth route. */
export function assertSafeAuthBasePath(basePath: string): string {
  const normalized = normalizeAuthBasePath(basePath);

  if (normalized === "/") {
    throw new Error(
      'Invalid basePath "/": Better Auth must be mounted on a dedicated path (e.g. "/auth" or "/api/auth"), not the application root.',
    );
  }

  return normalized;
}

export function isAuthPath(pathname: string, basePath: string): boolean {
  const normalized = normalizeAuthBasePath(basePath);
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

export function authWildcardPath(basePath: string): string {
  const normalized = normalizeAuthBasePath(basePath);
  return normalized === "/" ? "/*" : `${normalized}/*`;
}
