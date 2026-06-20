import { Carno } from '@carno.js/core';

const BETTER_AUTH_PLUGIN_MARKER = Symbol.for('carnojs-better-auth:plugin');

const DUPLICATE_BETTER_AUTH_REGISTRATION_MESSAGE =
    'CarnoBetterAuth is already registered on this Carno app. ' +
    'Call app.use(CarnoBetterAuth(...)) only once per application.';

const installedHosts = new WeakSet<object>();

let useGuardInstalled = false;

function isBetterAuthPlugin(plugin: Carno): boolean {
    return (
        (plugin as { [BETTER_AUTH_PLUGIN_MARKER]?: boolean })[BETTER_AUTH_PLUGIN_MARKER] === true
    );
}

export function markBetterAuthPlugin(plugin: Carno): Carno {
    Object.defineProperty(plugin, BETTER_AUTH_PLUGIN_MARKER, {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
    });

    return plugin;
}

/** Prevents merging multiple Better Auth plugins onto the same host Carno instance. */
export function ensureBetterAuthUseGuard(): void {
    if (useGuardInstalled) {
        return;
    }

    useGuardInstalled = true;

    const originalUse = Carno.prototype.use;

    // This is a very sensitive approach.
    // Must perform further testing against a Carno.js app and other plugins to ensure it doesn't get in the way.
    Carno.prototype.use = function (this: Carno, plugin: Carno) {
        if (isBetterAuthPlugin(plugin)) {
            if (installedHosts.has(this)) {
                throw new Error(DUPLICATE_BETTER_AUTH_REGISTRATION_MESSAGE);
            }

            installedHosts.add(this);
        }

        return originalUse.call(this, plugin);
    };
}
