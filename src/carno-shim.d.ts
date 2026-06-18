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

  export function withTestApp(
    routine: (harness: TestHarness) => Promise<void>,
    options?: unknown,
  ): Promise<void>;

  export interface TestHarness {
    resolve<T>(token: new (...args: never[]) => T): T;
    request(path: string, init?: RequestInit): Promise<Response>;
    get(path: string, init?: RequestInit): Promise<Response>;
    post(path: string, body?: unknown, init?: RequestInit): Promise<Response>;
    close(): Promise<void>;
  }
}
