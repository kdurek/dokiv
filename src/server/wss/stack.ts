import { type Stack } from "@/server/api/utils";
import { validateWebSocketRequest } from "@/server/auth/wss";
import { cachedStackList } from "@/server/wss/cache";
import {
  createStack,
  removeStack,
  saveStack,
  sendStackList,
  stackCommand,
  stackLogs,
} from "@/server/wss/services";
import type http from "node:http";
import { Server } from "socket.io";

type Callback = (e: { status: "success" | "error"; message: string }) => void;

export interface StackServerToClientEvents {
  stackList: (data: Stack[]) => void;
  stackLogs: (data: string) => void;
  stackCommand: (data: string) => void;
}

export interface StackClientToServerEvents {
  stackList: (data: { composeName: string }, callback: Callback) => void;
  stackLogs: (data: { composeName: string }) => void;
  stackCommand: (
    data: { composeName: string; command: "deploy" | "down" },
    callback: Callback,
  ) => void;
  refresh: () => void;
  createStack: (data: { composeName: string }, callback: Callback) => void;
  saveStack: (
    data: { composeName: string; stack: string },
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

  io.on("connection", async (socket) => {
    const { session } = await validateWebSocketRequest(socket.request);
    if (!session) socket.disconnect();

    void sendStackList(socket, cachedStackList.length > 0);

    socket.on("refresh", () => {
      void sendStackList(socket);
    });

    void stackLogs(socket);
    void stackCommand(socket);
    void createStack(socket);
    void saveStack(socket);
    void removeStack(socket);
  });
};
