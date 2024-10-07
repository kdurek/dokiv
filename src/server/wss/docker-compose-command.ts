import { validateWebSocketRequest } from "@/server/auth/wss";
import { spawnTerminal } from "@/server/wss/utils";
import type http from "node:http";
import { Server } from "socket.io";

export interface DockerComposeCommandServerToClientEvents {
  output: (data: string) => void;
}

export interface DockerComposeCommandClientToServerEvents {
  output: (
    data: { composeName: string; command: "deploy" | "down" },
    callback: (e: { status: "success" | "error"; message: string }) => void,
  ) => void;
}

export const setupDockerComposeCommandWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const io = new Server<
    DockerComposeCommandClientToServerEvents,
    DockerComposeCommandServerToClientEvents
  >(server, {
    path: "/docker-compose-command",
  });

  io.on("connection", async (socket) => {
    const { session } = await validateWebSocketRequest(socket.request);
    if (!session) socket.disconnect();

    socket.on("output", (data, callback) => {
      if (data.command === "deploy") {
        const ptyProcess = spawnTerminal(
          data.composeName,
          "docker compose up -d --remove-orphans",
        );

        ptyProcess.onData((data) => {
          socket.emit("output", data);
        });

        ptyProcess.onExit((code) => {
          if (code.exitCode === 0) {
            callback({
              status: "success",
              message: "Deployed successfully",
            });
          } else {
            callback({
              status: "error",
              message: "Failed to deploy",
            });
          }
        });

        socket.on("disconnect", () => {
          ptyProcess.kill();
        });
      }

      if (data.command === "down") {
        const ptyProcess = spawnTerminal(
          data.composeName,
          "docker compose down --remove-orphans",
        );

        ptyProcess.onData((data) => {
          socket.emit("output", data);
        });

        ptyProcess.onExit((code) => {
          if (code.exitCode === 0) {
            callback({
              status: "success",
              message: "Downed successfully",
            });
          } else {
            callback({
              status: "error",
              message: "Failed to down",
            });
          }
        });

        socket.on("disconnect", () => {
          ptyProcess.kill();
        });
      }
    });
  });
};
