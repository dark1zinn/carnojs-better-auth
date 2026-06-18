declare module "@carno.js/core" {
  export function Service(options?: { scope?: string }): ClassDecorator;

  export type MiddlewareHandler = (
    ctx: { path: string; req: Request },
  ) => Response | void | Promise<Response | void>;

  export class Carno {
    constructor(config?: { exports?: unknown[]; globalMiddlewares?: MiddlewareHandler[] });
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
