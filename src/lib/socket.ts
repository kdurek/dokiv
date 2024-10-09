"use client";

import type {
  StackClientToServerEvents,
  StackServerToClientEvents,
} from "@/server/wss/stack";
import { io, type Socket } from "socket.io-client";

const wsUrl =
  window.location.protocol === "http:"
    ? window.location.protocol + "//" + window.location.hostname + ":3000"
    : window.location.protocol + "//" + window.location.host;

export const stackSocket: Socket<
  StackServerToClientEvents,
  StackClientToServerEvents
> = io(wsUrl);
