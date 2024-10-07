import type http from "node:http";
import { Server } from "socket.io";
import { spawnTerminal } from "./utils";
import { validateWebSocketRequest } from "@/server/auth/wss";

export interface DockerComposeLogsServerToClientEvents {
  output: (data: string) => void;
}

export interface DockerComposeLogsClientToServerEvents {
  output: (data: { composeName: string }) => void;
}

export const setupDockerComposeLogsWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const io = new Server<
    DockerComposeLogsClientToServerEvents,
    DockerComposeLogsServerToClientEvents
  >(server, {
    path: "/docker-compose-logs",
  });

  io.on("connection", async (socket) => {
    const { session } = await validateWebSocketRequest(socket.request);
    if (!session) socket.disconnect();

    socket.on("output", (data) => {
      const ptyProcess = spawnTerminal(
        data.composeName,
        "docker compose logs -f",
      );

      ptyProcess.onData((data) => {
        socket.emit("output", data);
      });

      socket.on("disconnect", () => {
        ptyProcess.kill();
      });
    });
  });
};
