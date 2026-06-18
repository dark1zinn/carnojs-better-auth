declare module "@carno.js/core" {
  export function Service(options?: { scope?: string }): ClassDecorator;
  export function Controller(path: string): ClassDecorator;
  export function Get(path?: string): MethodDecorator;
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

  export class Carno {
    constructor(config?: { exports?: unknown[] });
    services(services: unknown): this;
    route(method: string, path: string, handler: unknown): this;
    get<T>(token: new (...args: never[]) => T): T;
  }

  export interface TestOptions {
    config?: { exports?: unknown[]; disableStartupLog?: boolean };
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

  export function createTestHarness(
    options?: TestOptions,
  ): Promise<TestHarness>;

  export function withTestApp(
    routine: (harness: TestHarness) => Promise<void>,
    options?: TestOptions,
  ): Promise<void>;
}
