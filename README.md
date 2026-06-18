# carnojs-better-auth

Better Auth integration for [Carno.js](https://github.com/carnojs/carno.js) applications.

Mounts [Better Auth](https://www.better-auth.com/) HTTP routes on your Carno app, exposes a DI-friendly `BetterAuthService`, and ships middleware for protecting controllers with session cookies.

## Requirements

- [Bun](https://bun.sh) >= 1.0
- `@carno.js/core` >= 1.0
- `better-auth` >= 1.0

## Install

```bash
bun add carnojs-better-auth @carno.js/core better-auth
```

## Quick start

```typescript
import { Carno } from "@carno.js/core";
import { CarnoBetterAuth } from "carnojs-better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

const app = new Carno();

app.use(
  CarnoBetterAuth({
    baseURL: "http://localhost:3000",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    emailAndPassword: { enabled: true },
  }),
);

app.listen(3000);
```

Better Auth routes are mounted at **`/auth`** by default (for example `/auth/sign-up/email`, `/auth/get-session`). [Better Auth's own docs](https://www.better-auth.com/docs/installation) often use `/api/auth`; this plugin defaults to `/auth` because Carno apps typically prefix API controllers explicitly (for example `@Controller("/api/me")`) rather than nesting entire sub-apps. Set `basePath: "/api/auth"` if you want to match the Better Auth guides exactly.

**Server** `baseURL` should be your app origin (for example `http://localhost:3000`). **Client** `baseURL` must include the auth path:

```typescript
import { createAuthClient } from "better-auth/client";
import {
  buildAuthClientBaseURL,
  DEFAULT_AUTH_BASE_PATH,
} from "carnojs-better-auth";

export const authClient = createAuthClient({
  baseURL: buildAuthClientBaseURL("http://localhost:3000", DEFAULT_AUTH_BASE_PATH),
  // equivalent to: baseURL: "http://localhost:3000/auth"
});
```

If `baseURL` includes a path that does not match `basePath` (for example `http://localhost:3000/api/auth` with default `basePath: "/auth"`), the plugin logs a startup warning with the corrected client URL.

Set `baseURL` in your Better Auth server options (or the `BETTER_AUTH_URL` env var). Better Auth uses it for callbacks, redirects, and cookie handling.

## Cross-origin requests (CORS)

Auth routes are registered programmatically on the Carno router, so they do not automatically inherit CORS headers from a host `Carno({ cors })` instance. Pass the same `cors` config to `CarnoBetterAuth` when a browser client calls `/auth/*` from another origin:

```typescript
const cors = {
  origins: "http://localhost:5173",
  credentials: true,
};

const app = new Carno({ cors });

app.use(
  CarnoBetterAuth({
    baseURL: "http://localhost:3000",
    cors, // required for auth routes to receive Access-Control-* headers
    trustedOrigins: ["http://localhost:5173"],
    // ...
  }),
);
```

- **`cors`** — mirrors [Carno CORS config](https://github.com/carnojs/carno.js); wraps auth handlers and handles `OPTIONS` preflight on `/auth/*`.
- **`trustedOrigins`** — Better Auth's own origin allowlist for cookies and CSRF ([cookies guide](https://www.better-auth.com/docs/concepts/cookies)). Configure both for cross-origin SPAs.

## Protecting routes

Apply `BetterAuthMiddleware` to controllers that require a session. Authenticated user and session are exposed via `@Locals`:

```typescript
import {
  Controller,
  Get,
  Locals,
  Middleware,
} from "@carno.js/core";
import {
  AUTH_SESSION_KEY,
  AUTH_USER_KEY,
  BetterAuthMiddleware,
} from "carnojs-better-auth";

@Controller("/me")
@Middleware(BetterAuthMiddleware)
class MeController {
  @Get()
  me(
    @Locals(AUTH_USER_KEY) user: { id: string; email: string },
    @Locals(AUTH_SESSION_KEY) session: { userId: string },
  ) {
    return { email: user.email, sessionUserId: session.userId };
  }
}
```

Unauthenticated requests receive **401** with Better Auth's standard JSON error shape:

```json
{ "code": "UNAUTHORIZED", "message": "Unauthorized" }
```

When session lookup fails unexpectedly (for example a database outage), protected routes return **503** with Carno's standard `{ "statusCode": 503, "message": "Authentication service unavailable" }` payload instead of an unhandled `500`.

## Programmatic access

Inject `BetterAuthService` anywhere Carno DI resolves services:

```typescript
import { Service } from "@carno.js/core";
import { BetterAuthService } from "carnojs-better-auth";

@Service()
class AccountService {
  constructor(private readonly auth: BetterAuthService) {}

  async getSession(headers: Headers) {
    return this.auth.auth.api.getSession({ headers });
  }
}
```

## Custom auth path

Pass `basePath` in the plugin options to change the mount point:

```typescript
CarnoBetterAuth({
  basePath: "/api/auth",
  baseURL: "http://localhost:3000",
  // ...
});
```

Keep `basePath` aligned with Better Auth's own `basePath` option so route registration and the auth handler agree.

Use a dedicated path segment such as `/auth` or `/api/auth`. The value `/` (or an empty string) is rejected because it would register a catch-all `/*` route and hijack your application.

## App-level URL prefix

Carno does not support `app.use("/api", subApp)` path-prefix mounting. Prefix URLs on each controller and align Better Auth with the same `basePath`:

```typescript
import { Carno, Controller, Get, Middleware } from "@carno.js/core";
import { CarnoBetterAuth, BetterAuthMiddleware } from "carnojs-better-auth";

@Controller("/api/me")
@Middleware(BetterAuthMiddleware)
class ApiMeController {
  @Get()
  me() {
    return { ok: true };
  }
}

const app = new Carno();

app.use(
  CarnoBetterAuth({
    basePath: "/api/auth",
    baseURL: "http://localhost:3000",
    // ...
  }),
);

app.controllers([ApiMeController]);
app.listen(3000);
// Auth:     http://localhost:3000/api/auth/*
// API:      http://localhost:3000/api/me
```

For nested controllers, Carno also supports `@Controller({ path: "/api", children: [ApiMeController] })` so child routes inherit the parent path. See the [Carno.js repository](https://github.com/carnojs/carno.js) for controller nesting details.

When using a custom auth path, set the Better Auth client `baseURL` to include it (for example `http://localhost:3000/api/auth`).

## Public API

| Export | Description |
|--------|-------------|
| `CarnoBetterAuth(options?)` | Carno plugin factory |
| `BetterAuthService` | Injectable wrapper around the Better Auth instance |
| `BetterAuthMiddleware` | Session guard; populates `ctx.locals` |
| `BetterAuthConfig` | Internal config token (advanced/testing) |
| `AUTH_USER_KEY` / `AUTH_SESSION_KEY` | Locals keys for `@Locals()` |
| `DEFAULT_AUTH_BASE_PATH` | Default mount path (`/auth`) |
| `buildAuthClientBaseURL(origin, basePath)` | Client SDK base URL helper |
| `BetterAuthModuleOptions` | Alias of Better Auth's `BetterAuthOptions` |
| `CarnoBetterAuthOptions` | Plugin options (`BetterAuthModuleOptions` + optional `cors`) |
| `AuthContext` / `AuthLocals` | Session typing helpers |

## Development

```bash
bun install
bun run typecheck   # src + test projects
bun run test:unit   # tests only (no rebuild)
bun run test        # build + full test suite
bun run build       # tsdown → dist/
```

## License

[Apache-2.0](./LICENSE)
