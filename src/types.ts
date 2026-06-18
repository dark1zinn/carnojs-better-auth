import type { Session, User } from "better-auth";
import { AUTH_SESSION_KEY, AUTH_USER_KEY } from "./constants.ts";

/** Session payload returned by `auth.api.getSession()`. */
export type AuthContext = {
  session: Session;
  user: User;
};

/** Request-scoped auth values stored on `ctx.locals` by the auth middleware. */
export type AuthLocals = {
  [AUTH_USER_KEY]: User;
  [AUTH_SESSION_KEY]: Session;
};
