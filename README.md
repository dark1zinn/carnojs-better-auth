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
import { Carno } from '@carno.js/core';
import { CarnoBetterAuth } from 'carnojs-better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';

const app = new Carno();

app.use(
    CarnoBetterAuth({
        baseURL: 'http://localhost:3000',
        database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
        emailAndPassword: { enabled: true },
    }),
);

app.listen(3000);
```

Register **one** `CarnoBetterAuth()` plugin per Carno application. A second `app.use(CarnoBetterAuth(...))` throws immediately — duplicate registration would merge conflicting auth controllers and DI providers.

Better Auth routes are mounted at **`/auth`** by default (for example `/auth/sign-up/email`, `/auth/get-session`). [Better Auth's own docs](https://www.better-auth.com/docs/installation) often use `/api/auth`; this plugin defaults to `/auth` because Carno apps typically prefix API controllers explicitly (for example `@Controller("/api/me")`) rather than nesting entire sub-apps. Set `basePath: "/api/auth"` if you want to match the Better Auth guides exactly.

**Server** `baseURL` should be your app origin (for example `http://localhost:3000`). **Client** `baseURL` must include the auth path:

```typescript
import { createAuthClient } from 'better-auth/client';
import { buildAuthClientBaseURL, DEFAULT_AUTH_BASE_PATH } from 'carnojs-better-auth';

export const authClient = createAuthClient({
    baseURL: buildAuthClientBaseURL('http://localhost:3000', DEFAULT_AUTH_BASE_PATH),
    // equivalent to: baseURL: "http://localhost:3000/auth"
});
```

If `baseURL` includes a path that does not match `basePath` (for example `http://localhost:3000/api/auth` with default `basePath: "/auth"`), the plugin logs a startup warning with the corrected client URL.

Set `baseURL` in your Better Auth server options (or the `BETTER_AUTH_URL` env var). Better Auth uses it for callbacks, redirects, and cookie handling.

## Cross-origin requests (CORS)

Better Auth routes are registered as a Carno controller, so they inherit CORS from the host app. Configure CORS once on your main `Carno` instance:

```typescript
const cors = {
    origins: 'http://localhost:5173',
    credentials: true,
};

const app = new Carno({ cors });

app.use(
    CarnoBetterAuth({
        baseURL: 'http://localhost:3000',
        trustedOrigins: ['http://localhost:5173'],
        // ...
    }),
);
```

- **`cors`** (on `Carno`) — [Carno CORS config](https://github.com/carnojs/carno.js); applies to `/auth/*` and all other controller routes. Unmatched `OPTIONS` preflight requests receive Carno's standard preflight response.
- **`trustedOrigins`** — Better Auth's own origin allowlist for cookies and CSRF ([cookies guide](https://www.better-auth.com/docs/concepts/cookies)). Configure both for cross-origin SPAs.

## Middleware and auth routes

Auth routes run through Carno's controller pipeline, so host middleware applies automatically:

```typescript
const app = new Carno({
    cors,
    globalMiddlewares: [LoggingMiddleware],
});

app.middlewares([RequestIdMiddleware]);

app.use(CarnoBetterAuth({ baseURL: 'http://localhost:3000' /* ... */ }));
```

| Traffic                        | Carno middleware (`globalMiddlewares`, `app.middlewares()`, `@Middleware`) | `BetterAuthMiddleware`                     |
| ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------ |
| `/auth/*`                      | Yes                                                                        | No (unless applied to the auth controller) |
| Protected `@Controller` routes | When applied                                                               | Only when applied                          |

For advanced cases where you must intercept the raw Better Auth `Request → Response` handler before Carno's `Context` layer, use `wrapHandler`:

```typescript
app.use(
    CarnoBetterAuth({
        baseURL: 'http://localhost:3000',
        wrapHandler: (handler) => async (req) => {
            const response = await handler(req);
            const headers = new Headers(response.headers);
            headers.set('x-auth-pipeline', '1');
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        },
        // ...
    }),
);
```

Prefer Carno middleware for logging, rate limits, and request IDs — it runs on `/auth/*` without extra configuration.

## Protecting routes

Apply `BetterAuthMiddleware` to controllers that require a session. Authenticated user and session are exposed via `@Locals`:

```typescript
import { Controller, Get, Locals, Middleware } from '@carno.js/core';
import { AUTH_SESSION_KEY, AUTH_USER_KEY, BetterAuthMiddleware } from 'carnojs-better-auth';

@Controller('/me')
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
import { Service } from '@carno.js/core';
import { BetterAuthService } from 'carnojs-better-auth';

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
    basePath: '/api/auth',
    baseURL: 'http://localhost:3000',
    // ...
});
```

Keep `basePath` aligned with Better Auth's own `basePath` option so route registration and the auth handler agree.

Use a dedicated path segment such as `/auth` or `/api/auth`. The value `/` (or an empty string) is rejected because it would register a catch-all `/*` route and hijack your application.

## App-level URL prefix

Carno does not support `app.use("/api", subApp)` path-prefix mounting. Prefix URLs on each controller and align Better Auth with the same `basePath`:

```typescript
import { Carno, Controller, Get, Middleware } from '@carno.js/core';
import { CarnoBetterAuth, BetterAuthMiddleware } from 'carnojs-better-auth';

@Controller('/api/me')
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
        basePath: '/api/auth',
        baseURL: 'http://localhost:3000',
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

| Export                                         | Description                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `CarnoBetterAuth(options?)`                    | Carno plugin factory                                                |
| `BetterAuthService`                            | Injectable wrapper around the Better Auth instance                  |
| `BetterAuthMiddleware`                         | Session guard; populates `ctx.locals`                               |
| `BetterAuthConfig`                             | Internal config token (advanced/testing)                            |
| `AUTH_USER_KEY` / `AUTH_SESSION_KEY`           | Locals keys for `@Locals()`                                         |
| `DEFAULT_AUTH_BASE_PATH`                       | Default mount path (`/auth`)                                        |
| `buildAuthClientBaseURL(origin, basePath)`     | Client SDK base URL helper                                          |
| `BetterAuthModuleOptions`                      | Alias of Better Auth's `BetterAuthOptions`                          |
| `CarnoBetterAuthOptions`                       | Plugin options (`BetterAuthModuleOptions` + optional `wrapHandler`) |
| `AuthRouteHandler` / `AuthRouteHandlerWrapper` | Types for `wrapHandler`                                             |
| `AuthContext` / `AuthLocals`                   | Session typing helpers                                              |

## Development

```bash
bun install          # installs Husky hooks via prepare
bun run format       # Prettier write
bun run format:check # Prettier CI check
bun run fallow       # dead code / dupes / health report
bun run fallow:fix   # apply auto-fixes
bun run typecheck    # src + test projects
bun run test:unit    # tests only (no rebuild)
bun run test         # build + full test suite
bun run build        # tsdown → dist/
```

Pre-commit runs Prettier on staged files and applies Fallow fixes when TypeScript files are staged. Pre-push runs the full test suite.

## License

[Apache-2.0](./LICENSE)
