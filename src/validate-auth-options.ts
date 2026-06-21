import type { BetterAuthModuleOptions } from './interfaces/better-auth-module-options.interface.ts';

/** Minimum length Better Auth recommends for signing secrets. */
export const MIN_AUTH_SECRET_LENGTH = 32;

/** Env vars read when resolving Better Auth options at plugin init. */
export type AuthOptionsValidationEnv = {
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    AUTH_SECRET?: string;
};

export type AuthValidationOptions = {
    /** Skip all Carno-side validation (for tests and advanced setups). */
    skipValidation?: boolean;
    /**
     * When `false`, log validation problems instead of throwing.
     * Defaults to `true`.
     */
    strict?: boolean;
};

export class AuthConfigValidationError extends Error {
    constructor(message: string) {
        super(`[carnojs-better-auth] ${message}`);
        this.name = 'AuthConfigValidationError';
    }
}

type DynamicBaseURLConfig = { allowedHosts: string[] };

function isDynamicBaseURLConfig(
    baseURL: BetterAuthModuleOptions['baseURL'],
): baseURL is DynamicBaseURLConfig {
    return (
        typeof baseURL === 'object' &&
        baseURL !== null &&
        'allowedHosts' in baseURL &&
        Array.isArray(baseURL.allowedHosts)
    );
}

function resolveSecret(
    options: BetterAuthModuleOptions,
    env: AuthOptionsValidationEnv,
): string | undefined {
    const secret = options.secret ?? env.BETTER_AUTH_SECRET ?? env.AUTH_SECRET;
    return secret && secret.length > 0 ? secret : undefined;
}

function resolveBaseURL(
    options: BetterAuthModuleOptions,
    env: AuthOptionsValidationEnv,
): string | undefined {
    if (isDynamicBaseURLConfig(options.baseURL)) {
        return options.baseURL.allowedHosts.length > 0 ? 'dynamic' : undefined;
    }

    if (typeof options.baseURL === 'string' && options.baseURL.length > 0) {
        return options.baseURL;
    }

    const fromEnv = env.BETTER_AUTH_URL;
    return fromEnv && fromEnv.length > 0 ? fromEnv : undefined;
}

function hasEnabledSocialProviders(
    socialProviders: BetterAuthModuleOptions['socialProviders'],
): boolean {
    if (!socialProviders) {
        return false;
    }

    return Object.values(socialProviders).some((config) => {
        if (config == null) {
            return false;
        }

        if (typeof config === 'function') {
            return true;
        }

        return config.enabled !== false;
    });
}

/** Whether cookie/session auth flows need a stable public base URL. */
export function usesCookieBasedAuth(options: BetterAuthModuleOptions): boolean {
    if (options.emailAndPassword?.enabled === true) {
        return true;
    }

    if (hasEnabledSocialProviders(options.socialProviders)) {
        return true;
    }

    return options.database !== undefined;
}

function reportValidationIssue(message: string, strict: boolean): void {
    if (strict) {
        throw new AuthConfigValidationError(message);
    }

    console.warn(`[carnojs-better-auth] ${message}`);
}

/**
 * Fail fast when required Better Auth options are missing.
 * Called during {@link CarnoBetterAuth} / {@link BetterAuthConfig} initialization.
 */
export function validateAuthOptions(
    options: BetterAuthModuleOptions,
    env: AuthOptionsValidationEnv = process.env as AuthOptionsValidationEnv,
    validation: AuthValidationOptions = {},
): void {
    const { skipValidation = false, strict = true } = validation;

    if (skipValidation) {
        return;
    }

    const secret = resolveSecret(options, env);
    if (!secret) {
        reportValidationIssue(
            'Missing auth secret. Set `secret` in CarnoBetterAuth options or `BETTER_AUTH_SECRET` in the environment (minimum 32 characters). Generate one with `npx auth secret` or `openssl rand -base64 32`.',
            strict,
        );
    } else if (secret.length < MIN_AUTH_SECRET_LENGTH) {
        reportValidationIssue(
            `Auth secret is too short (${secret.length} characters). Use at least ${MIN_AUTH_SECRET_LENGTH} characters for production deployments.`,
            strict,
        );
    }

    if (!usesCookieBasedAuth(options)) {
        return;
    }

    if (isDynamicBaseURLConfig(options.baseURL) && options.baseURL.allowedHosts.length === 0) {
        reportValidationIssue(
            'Dynamic baseURL requires at least one entry in `baseURL.allowedHosts`.',
            strict,
        );
        return;
    }

    const baseURL = resolveBaseURL(options, env);
    if (!baseURL) {
        reportValidationIssue(
            'Missing baseURL for cookie-based auth. Set `baseURL` in CarnoBetterAuth options or `BETTER_AUTH_URL` in the environment, or use a dynamic baseURL with `allowedHosts`.',
            strict,
        );
    }
}
