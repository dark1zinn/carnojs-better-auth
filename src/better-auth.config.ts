import { betterAuth } from "better-auth";
import type { BetterAuthModuleOptions } from "./interfaces/better-auth-module-options.interface.ts";
import { resolveAuthOptions } from "./constants.ts";

/** Holds the resolved module options and shared Better Auth runtime instance. */
export class BetterAuthConfig {
  public readonly options: BetterAuthModuleOptions;
  public readonly auth: ReturnType<typeof betterAuth>;

  constructor(options: BetterAuthModuleOptions) {
    this.options = resolveAuthOptions(options);
    this.auth = betterAuth(this.options);
  }
}
