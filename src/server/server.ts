import { env } from "@/env";
import { setupStackWebSocketServer } from "@/server/wss/stack";
import { createServer } from "http";
import next from "next";
import { parse } from "url";

const port = parseInt("3000", 10);
const dev = env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    void handle(req, res, parsedUrl);
  });

  void setupStackWebSocketServer(server);

  server.listen(port);
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : env.NODE_ENV
    }`,
  );
});
