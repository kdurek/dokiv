import { lucia } from "@/server/auth";
import type { IncomingMessage } from "http";
import type { Session, User } from "lucia";

export async function validateWebSocketRequest(
  req: IncomingMessage,
): Promise<{ user: User; session: Session } | { user: null; session: null }> {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);
  return result;
}
