import { auth } from "@/server/auth";
import type { IncomingMessage } from "node:http";
import { fromNodeHeaders } from "better-auth/node";

export const validateWebSocketAuth = async (req: IncomingMessage) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return session;
};
