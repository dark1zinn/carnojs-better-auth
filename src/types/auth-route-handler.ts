export type AuthRouteHandler = (
  req: Request,
) => Response | Promise<Response>;

export type AuthRouteHandlerWrapper = (
  handler: AuthRouteHandler,
) => AuthRouteHandler;
