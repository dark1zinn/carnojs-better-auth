import {
  Service,
  type CarnoClosure,
  type CarnoMiddleware,
  type Context,
} from "@carno.js/core";
import { BetterAuthService } from "../better-auth.service.ts";
import { AUTH_SESSION_KEY, AUTH_USER_KEY } from "../constants.ts";

@Service()
export class BetterAuthMiddleware implements CarnoMiddleware {
  constructor(private readonly authService: BetterAuthService) {}

  async handle(ctx: Context, next: CarnoClosure): Promise<Response | void> {
    const session = await this.authService.auth.api.getSession({
      headers: ctx.headers,
    });

    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    ctx.locals[AUTH_USER_KEY] = session.user;
    ctx.locals[AUTH_SESSION_KEY] = session.session;
    await next();
  }
}
