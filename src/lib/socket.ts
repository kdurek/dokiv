"use client";

import type {
  StackClientToServerEvents,
  StackServerToClientEvents,
} from "@/server/wss/stack";
import { io, type Socket } from "socket.io-client";

const wsUrl =
  process.env.NODE_ENV === "production"
    ? window.location.protocol + "//" + window.location.host
    : "http://localhost:3000";

export const stackSocket: Socket<
  StackServerToClientEvents,
  StackClientToServerEvents
> = io(wsUrl);
