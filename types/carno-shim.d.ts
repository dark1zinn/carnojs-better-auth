declare module '@carno.js/core' {
    export function Service(options?: { scope?: string }): ClassDecorator;
    export function Controller(path: string): ClassDecorator;
    export function Get(path?: string): MethodDecorator;
    export function Post(path?: string): MethodDecorator;
    export function Put(path?: string): MethodDecorator;
    export function Patch(path?: string): MethodDecorator;
    export function Delete(path?: string): MethodDecorator;
    export function Head(path?: string): MethodDecorator;
    export function Req(): ParameterDecorator;
    export function Middleware(middleware: unknown): ClassDecorator & MethodDecorator;
    export function Locals(key?: string): ParameterDecorator;

    export type CarnoClosure = () => Promise<Response>;

    export interface Context {
        readonly headers: Headers;
        readonly req: Request;
        locals: Record<string, unknown>;
    }

    export interface CarnoMiddleware {
        handle(ctx: Context, next: CarnoClosure): Promise<Response | void>;
    }

    export type MiddlewareEntry = unknown;

    export interface CarnoConfig {
        exports?: unknown[];
        globalMiddlewares?: MiddlewareEntry[];
        disableStartupLog?: boolean;
        cors?: CorsConfig;
    }

    export class Carno {
        constructor(config?: CarnoConfig);
        use(plugin: Carno): this;
        services(services: unknown): this;
        controllers(controllerClass: unknown | unknown[]): this;
        route(method: string, path: string, handler: unknown): this;
        get<T>(token: new (...args: never[]) => T): T;
    }

    export interface CorsConfig {
        origins: string | string[] | RegExp | ((origin: string) => boolean);
        methods?: string[];
        allowedHeaders?: string[];
        exposedHeaders?: string[];
        credentials?: boolean;
        maxAge?: number;
    }

    export class CorsHandler {
        constructor(config: CorsConfig);
        preflight(origin: string): Response;
        apply(response: Response, origin: string): Response;
        isAllowed(origin: string): boolean;
    }

    export class HttpException extends Error {
        readonly statusCode: number;
        toResponse(): Response;
    }

    export class ServiceUnavailableException extends HttpException {}

    export interface TestOptions {
        config?: CarnoConfig;
        listen?: boolean | number;
        port?: number;
        controllers?: (new (...args: never[]) => unknown)[];
        services?: unknown[];
        plugins?: Carno[];
    }

    export interface TestHarness {
        resolve<T>(token: new (...args: never[]) => T): T;
        request(path: string, init?: RequestInit): Promise<Response>;
        get(path: string, init?: RequestInit): Promise<Response>;
        post(path: string, body?: unknown, init?: RequestInit): Promise<Response>;
        put(path: string, body?: unknown, init?: RequestInit): Promise<Response>;
        delete(path: string, init?: RequestInit): Promise<Response>;
        close(): Promise<void>;
    }

    export function createTestHarness(options?: TestOptions): Promise<TestHarness>;

    export function withTestApp(
        routine: (harness: TestHarness) => Promise<void>,
        options?: TestOptions,
    ): Promise<void>;
}
