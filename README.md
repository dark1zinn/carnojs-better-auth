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

Better Auth routes are mounted at **`/auth`** by default (for example `/auth/sign-up/email`, `/auth/get-session`).

Set `baseURL` in your Better Auth options (or the `BETTER_AUTH_URL` env var). Better Auth uses it for callbacks, redirects, and cookie handling.

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

Unauthenticated requests receive `401` with `{ "message": "Unauthorized" }`.

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

## App-level URL prefix

The plugin registers routes on the Carno instance you attach it to. If your app serves controllers under a prefix (for example `/api`), mount the plugin on that same scoped app so auth routes follow the same prefix:

```typescript
const api = new Carno();
api.use(CarnoBetterAuth({ /* ... */ }));
api.controllers([MeController]);

app.use("/api", api); // auth at /api/auth, controllers at /api/me
```

## Public API

| Export | Description |
|--------|-------------|
| `CarnoBetterAuth(options?)` | Carno plugin factory |
| `BetterAuthService` | Injectable wrapper around the Better Auth instance |
| `BetterAuthMiddleware` | Session guard; populates `ctx.locals` |
| `BetterAuthConfig` | Internal config token (advanced/testing) |
| `AUTH_USER_KEY` / `AUTH_SESSION_KEY` | Locals keys for `@Locals()` |
| `DEFAULT_AUTH_BASE_PATH` | Default mount path (`/auth`) |
| `BetterAuthModuleOptions` | Alias of Better Auth's `BetterAuthOptions` |
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
