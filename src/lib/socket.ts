"use client";

import { io, type Socket } from "socket.io-client";
import { wsUrlBase } from "@/lib/utils";
import type {
  DockerComposeCommandClientToServerEvents,
  DockerComposeCommandServerToClientEvents,
} from "@/server/wss/docker-compose-command";
import type {
  DockerComposeLogsClientToServerEvents,
  DockerComposeLogsServerToClientEvents,
} from "@/server/wss/docker-compose-logs";

export const dockerComposeCommandSocket: Socket<
  DockerComposeCommandServerToClientEvents,
  DockerComposeCommandClientToServerEvents
> = io(wsUrlBase, {
  path: `/docker-compose-command`,
});

export const dockerComposeLogsSocket: Socket<
  DockerComposeLogsServerToClientEvents,
  DockerComposeLogsClientToServerEvents
> = io(wsUrlBase, {
  path: `/docker-compose-logs`,
});
