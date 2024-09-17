import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { setupDockerComposeLogsWebSocketServer } from "@/server/wss/docker-compose-logs";
import { setupDockerComposeCommandWebSocketServer } from "@/server/wss/docker-compose-command";

const port = parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    void handle(req, res, parsedUrl);
  });

  void setupDockerComposeCommandWebSocketServer(server);
  void setupDockerComposeLogsWebSocketServer(server);

  server.listen(port);
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`,
  );
});
