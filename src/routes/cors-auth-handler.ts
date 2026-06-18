import { CorsHandler, type CorsConfig } from "@carno.js/core";

export function wrapAuthHandlerWithCors(
  handler: (req: Request) => Response | Promise<Response>,
  cors: CorsConfig,
): (req: Request) => Promise<Response> {
  const corsHandler = new CorsHandler(cors);

  return async (req: Request) => {
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
      return corsHandler.preflight(origin ?? "");
    }

    const response = await handler(req);

    if (origin) {
      return corsHandler.apply(response, origin);
    }

    return response;
  };
}
