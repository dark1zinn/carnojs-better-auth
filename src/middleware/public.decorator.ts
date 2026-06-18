import { AUTH_PUBLIC_METADATA_KEY } from "../constants.ts";

// Store public route markers in a WeakMap since Reflect.metadata may not be available
const publicMarkers = new WeakMap<object, Set<string | symbol>>();

/**
 * Marks a route as public and exempts it from {@link BetterAuthMiddleware} session requirement.
 *
 * Use this decorator on methods within a controller that has `@Middleware(BetterAuthMiddleware)`.
 * Public routes will return 200 without a session, while non-public routes still require authentication.
 *
 * @example
 * ```typescript
 * @Controller("/api")
 * @Middleware(BetterAuthMiddleware)
 * class ApiController {
 *   @Get("/health")
 *   @Public()
 *   health() {
 *     return { status: "ok" };
 *   }
 *
 *   @Get("/profile")
 *   profile(@Locals(AUTH_USER_KEY) user: User) {
 *     return { user };  // 401 without session
 *   }
 * }
 * ```
 */
export const Public = (): MethodDecorator => {
  return (target: object, propertyKey: string | symbol | undefined) => {
    if (!propertyKey) return;
    
    // Store in WeakMap
    if (!publicMarkers.has(target)) {
      publicMarkers.set(target, new Set());
    }
    publicMarkers.get(target)!.add(propertyKey);
  };
};

/**
 * Check if a method on a prototype is marked as public.
 */
export function isMethodPublic(target: object, methodName: string | symbol): boolean {
  const markers = publicMarkers.get(target);
  return markers ? markers.has(methodName) : false;
}
