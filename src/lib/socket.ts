"use client";

import { io, type Socket } from "socket.io-client";
import type {
  DockerComposeCommandClientToServerEvents,
  DockerComposeCommandServerToClientEvents,
} from "@/server/wss/docker-compose-command";
import type {
  DockerComposeLogsClientToServerEvents,
  DockerComposeLogsServerToClientEvents,
} from "@/server/wss/docker-compose-logs";

const wsUrl =
  window.location.protocol === "http:"
    ? window.location.protocol + "//" + window.location.hostname + ":3000"
    : window.location.protocol + "//" + window.location.host;

export const dockerComposeCommandSocket: Socket<
  DockerComposeCommandServerToClientEvents,
  DockerComposeCommandClientToServerEvents
> = io(wsUrl, {
  path: `/docker-compose-command`,
});

export const dockerComposeLogsSocket: Socket<
  DockerComposeLogsServerToClientEvents,
  DockerComposeLogsClientToServerEvents
> = io(wsUrl, {
  path: `/docker-compose-logs`,
});
