import { betterAuth } from 'better-auth';
import { warnOnBaseUrlBasePathMismatch } from './auth-url.ts';
import { resolveAuthOptions, DEFAULT_AUTH_BASE_PATH } from './constants.ts';
import type { BetterAuthModuleOptions } from './interfaces/better-auth-module-options.interface.ts';
import {
    validateAuthOptions,
    type AuthOptionsValidationEnv,
    type AuthValidationOptions,
} from './validate-auth-options.ts';

/** Holds the resolved module options and shared Better Auth runtime instance. */
export class BetterAuthConfig {
    public readonly options: BetterAuthModuleOptions;
    public readonly auth: ReturnType<typeof betterAuth>;

    constructor(
        options: BetterAuthModuleOptions,
        validation: AuthValidationOptions & { env?: AuthOptionsValidationEnv } = {},
    ) {
        const { env, ...validationOptions } = validation;
        validateAuthOptions(options, env, validationOptions);

        this.options = resolveAuthOptions(options);

        warnOnBaseUrlBasePathMismatch({
            baseURL: this.options.baseURL,
            basePath: this.options.basePath ?? DEFAULT_AUTH_BASE_PATH,
        });

        this.auth = betterAuth(this.options);
    }
}
