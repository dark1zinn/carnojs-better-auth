import { Service } from "@carno.js/core";
import { BetterAuthConfig } from "./constants.ts";

@Service()
export class BetterAuthService {
  public readonly auth: BetterAuthConfig["auth"];

  constructor(config: BetterAuthConfig) {
    this.auth = config.auth;
  }
}
