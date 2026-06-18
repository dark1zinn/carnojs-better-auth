import {
  Service,
  type CarnoClosure,
  type CarnoMiddleware,
  type Context,
} from "@carno.js/core";
import { BetterAuthService } from "../better-auth.service.ts";
import { AUTH_SESSION_KEY, AUTH_USER_KEY } from "../constants.ts";
import { resolveProtectedSession } from "./resolve-protected-session.ts";
import { publicRouteRegistry } from "./public-route-registry.ts";

@Service()
export class BetterAuthMiddleware implements CarnoMiddleware {
  constructor(private readonly authService: BetterAuthService) {}

  async handle(ctx: Context, next: CarnoClosure): Promise<Response | void> {
    // Check if the current route is marked as @Public()
    const url = new URL(ctx.req.url);
    const isPublic = publicRouteRegistry.isPublic(url.pathname);
    
    if (isPublic) {
      // Public route; skip auth check
      await next();
      return;
    }

    const result = await resolveProtectedSession(
      this.authService,
      ctx.headers,
    );

    if (!result.ok) {
      return result.response;
    }

    ctx.locals[AUTH_USER_KEY] = result.session.user;
    ctx.locals[AUTH_SESSION_KEY] = result.session.session;
    await next();
  }
}
