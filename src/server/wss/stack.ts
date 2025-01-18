import { type Stack } from "@/server/utils";
import { logger } from "@/server/utils/logger";
import { validateWebSocketAuth } from "@/server/wss/auth";
import {
  onCreateStack,
  onRemoveStack,
  onSaveCompose,
  onStackCommand,
  onStackLogs,
  onStackList,
  onSaveEnv,
  handleConnection,
} from "@/server/wss/services";
import type http from "node:http";
import { Server } from "socket.io";

export type StackCommand = "deploy" | "down";

export interface StackCommandData {
  composeName: string;
  command: StackCommand;
}

type Callback = (e: { status: "success" | "error"; message: string }) => void;

export interface StackServerToClientEvents {
  stackList: (data: Stack[]) => void;
  stackLogs: (data: string) => void;
  stackCommand: (data: string) => void;
  error: (error: { message: string }) => void;
}

export interface StackClientToServerEvents {
  stackList: () => void;
  stackLogs: (data: { composeName: string }) => void;
  stackCommand: (
    data: { composeName: string; command: "deploy" | "down" },
    callback: Callback,
  ) => void;
  refresh: () => void;
  createStack: (data: { composeName: string }, callback: Callback) => void;
  saveCompose: (
    data: { composeName: string; composeFile: string },
    callback: Callback,
  ) => void;
  saveEnv: (
    data: { composeName: string; envFile: string },
    callback: Callback,
  ) => void;
  removeStack: (data: { composeName: string }, callback: Callback) => void;
}

export const setupStackWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const io = new Server<StackClientToServerEvents, StackServerToClientEvents>(
    server,
  );

  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", err);
  });

  io.on("connect_error", (err) => {
    logger.error("Socket connection error:", err);
  });

  io.on("connection", async (socket) => {
    const session = await validateWebSocketAuth(socket.request);
    if (!session) {
      logger.error("Unauthorized socket connection");
      socket.disconnect();
      return;
    }

    logger.info(`Client connected: ${socket.id}`);
    handleConnection(socket);

    socket.on("error", (error) => {
      logger.error(`Socket ${socket.id} error:`, error);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    void onCreateStack(socket);
    void onRemoveStack(socket);
    void onSaveCompose(socket);
    void onSaveEnv(socket);
    void onStackCommand(socket);
    void onStackList(socket);
    void onStackLogs(socket);
  });

  return io;
};
