import { AUTH_PUBLIC_METADATA_KEY } from "../constants.ts";
import { isMethodPublic } from "./public.decorator.ts";

/**
 * Service that tracks public routes and checks if a route is marked as public.
 * Used by BetterAuthMiddleware to bypass auth for public routes.
 */
export class PublicRouteRegistry {
  private publicRoutes = new Map<string, boolean>();
  private controllerMetadata = new Map<string, Map<string, boolean>>();

  /**
   * Register a controller's public routes.
   * @param controller - The controller class
   * @param controllerPath - The controller path (e.g., "/api")
   */
  registerController(controller: any, controllerPath: string): void {
    if (!controller.prototype) return;

    const methodNames = Object.getOwnPropertyNames(controller.prototype);
    const publicMethodMap = new Map<string, boolean>();

    for (const methodName of methodNames) {
      if (methodName === "constructor") continue;

      const isPublic = isMethodPublic(controller.prototype, methodName);

      if (isPublic) {
        publicMethodMap.set(methodName, true);

        // Try to infer paths from method names (simplified)
        // In practice, Carno would provide this info
        const methodPath = this.inferMethodPath(methodName);
        const fullPath = this.normalizePath(controllerPath + methodPath);
        this.publicRoutes.set(fullPath, true);
      }
    }

    if (publicMethodMap.size > 0) {
      this.controllerMetadata.set(controllerPath, publicMethodMap);
    }
  }

  /**
   * Register a route as public by path.
   * @param controllerPath - The controller path (e.g., "/api")
   * @param methodPath - The method path (e.g., "/health")
   */
  registerPublic(controllerPath: string, methodPath: string): void {
    const fullPath = this.normalizePath(controllerPath + (methodPath || ""));
    this.publicRoutes.set(fullPath, true);
  }

  /**
   * Check if a request path is marked as public.
   * @param pathname - The request pathname (e.g., "/api/health")
   */
  isPublic(pathname: string): boolean {
    const normalized = this.normalizePath(pathname);
    return this.publicRoutes.get(normalized) === true;
  }

  private normalizePath(path: string): string {
    // Normalize path: remove trailing slashes and ensure it starts with /
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    // Remove trailing slash unless it's the root
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path;
  }

  private inferMethodPath(methodName: string): string {
    // Convert camelCase method names to kebab-case paths
    // e.g., "getHealth" -> "/get-health", "health" -> "/health"
    return "/" + methodName.replace(/([A-Z])/g, (match) => "-" + match.toLowerCase()).replace(/^-/, "");
  }
}

// Global registry instance (shared across the app)
export const publicRouteRegistry = new PublicRouteRegistry();
