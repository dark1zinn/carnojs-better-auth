import type { CorsConfig } from "@carno.js/core";
import type { BetterAuthModuleOptions } from "./better-auth-module-options.interface.ts";

/** Options accepted by {@link CarnoBetterAuth}. */
export type CarnoBetterAuthOptions = BetterAuthModuleOptions & {
  /**
   * Mirror the host Carno app's `cors` config so programmatic `/auth/*`
   * routes receive the same `Access-Control-*` headers as controller routes.
   */
  cors?: CorsConfig;
};
