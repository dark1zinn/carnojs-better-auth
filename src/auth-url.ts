import { normalizeAuthBasePath } from "./constants.ts";

const MISMATCH_PREFIX = "[carnojs-better-auth]";

/**
 * Builds the Better Auth client `baseURL` from an app origin and auth `basePath`.
 * Use with `createAuthClient({ baseURL })` so client requests hit the same routes
 * the Carno plugin mounts (default `/auth`, not Better Auth docs' `/api/auth`).
 */
export function buildAuthClientBaseURL(
  appBaseURL: string,
  basePath: string,
): string {
  const url = new URL(appBaseURL);
  url.pathname = normalizeAuthBasePath(basePath);
  return url.href.replace(/\/$/, "");
}

export function getBaseUrlPathname(baseURL: string): string | null {
  try {
    return normalizeAuthBasePath(new URL(baseURL).pathname || "/");
  } catch {
    return null;
  }
}

/** Warn when `baseURL` includes a path segment that disagrees with `basePath`. */
export function warnOnBaseUrlBasePathMismatch(options: {
  baseURL?: string | { allowedHosts?: string[] };
  basePath: string;
}): void {
  const { baseURL, basePath } = options;

  if (typeof baseURL !== "string" || !baseURL) {
    return;
  }

  const urlPath = getBaseUrlPathname(baseURL);

  if (urlPath === null) {
    return;
  }

  const normalizedBasePath = normalizeAuthBasePath(basePath);

  // Origin-only baseURL (pathname "/") is valid for Better Auth server config.
  if (urlPath === "/") {
    return;
  }

  if (urlPath !== normalizedBasePath) {
    const clientBaseURL = buildAuthClientBaseURL(
      new URL(baseURL).origin,
      normalizedBasePath,
    );

    console.warn(
      `${MISMATCH_PREFIX} baseURL path "${urlPath}" does not match basePath "${normalizedBasePath}". ` +
        `Use the app origin in server baseURL (e.g. "${new URL(baseURL).origin}") with basePath set separately, ` +
        `or align both to the same path. Auth client baseURL should be "${clientBaseURL}".`,
    );
  }
}
