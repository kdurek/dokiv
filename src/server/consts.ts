import { env } from "@/env";

export const SORT_ORDER = ["running", "exited", "unknown"];

export const COMPOSE_FILE_NAME = "compose.yaml";

export const COMPOSE_FILE_NAMES = [
  "docker-compose.yaml",
  "compose.yaml",
  "docker-compose.yml",
  "compose.yml",
];

export const BASE_PATH =
  env.NODE_ENV !== "production" ? ".docker/data" : "/app/data";
export const DATABASE_URL = `${BASE_PATH}/dokiv.db`;
