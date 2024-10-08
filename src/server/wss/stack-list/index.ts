import { type Stack } from "@/server/api/utils";
import { validateWebSocketRequest } from "@/server/auth/wss";
import { cachedStackList } from "@/server/wss/stack-list/cache";
import {
  createStack,
  removeStack,
  saveStack,
  sendStackList,
} from "@/server/wss/stack-list/services";
import type http from "node:http";
import { Server } from "socket.io";

export interface StackListServerToClientEvents {
  stackList: (data: Stack[]) => void;
}

export interface StackListClientToServerEvents {
  stackList: (
    data: { composeName: string },
    callback: (e: { status: "success" | "error"; message: string }) => void,
  ) => void;
  refresh: () => void;
  createStack: (
    data: { composeName: string },
    callback: (e: { status: "success" | "error"; message: string }) => void,
  ) => void;
  saveStack: (
    data: { composeName: string; stack: string },
    callback: (e: { status: "success" | "error"; message: string }) => void,
  ) => void;
  removeStack: (
    data: { composeName: string },
    callback: (e: { status: "success" | "error"; message: string }) => void,
  ) => void;
}

export const setupStackListWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const io = new Server<
    StackListClientToServerEvents,
    StackListServerToClientEvents
  >(server, {
    path: "/stack-list",
  });

  io.on("connection", async (socket) => {
    const { session } = await validateWebSocketRequest(socket.request);
    if (!session) socket.disconnect();

    void sendStackList(socket, cachedStackList.length > 0);

    socket.on("refresh", () => {
      void sendStackList(socket);
    });

    void createStack(socket);
    void saveStack(socket);
    void removeStack(socket);
  });
};
