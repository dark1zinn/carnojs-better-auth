import { Service } from "@carno.js/core";
import { betterAuth } from "better-auth";
import { BetterAuthConfig } from "./constants.ts";

@Service()
export class BetterAuthService {
  public readonly auth: ReturnType<typeof betterAuth>;

  constructor(config: BetterAuthConfig) {
    this.auth = betterAuth(config.options);
  }
}
