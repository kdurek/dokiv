import { env } from "@/env";
import { composeFileExists, getStack, type Stack } from "@/server/utils";
import { COMPOSE_FILE_NAME, ENV_FILE_NAME, SORT_ORDER } from "@/server/consts";
import { dockerCompose, type DockerComposeError } from "@/server/docker";
import type {
  StackClientToServerEvents,
  StackServerToClientEvents,
} from "@/server/wss/stack";
import { getCachedStackList, updateCachedStackList } from "@/server/wss/cache";
import {
  spawnTerminal,
  addSocket,
  broadcastToAll,
  removeSocket,
} from "@/server/wss/utils";
import fs from "node:fs/promises";
import type { Socket } from "socket.io";
import { logger } from "@/server/utils/logger";

export const sendStackList = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
  cache = false,
) => {
  try {
    const cachedList = getCachedStackList();
    if (cache && cachedList && cachedList.length > 0) {
      socket.emit("stackList", cachedList);
      return;
    }

    const entries = await fs.readdir(env.STACKS_DIR, {
      withFileTypes: true,
      encoding: "utf-8",
    });

    const stackPromises = entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        try {
          const hasComposeFile = await composeFileExists(env.STACKS_DIR, entry.name);
          if (!hasComposeFile) {
            logger.warn(`No compose file found for stack ${entry.name}`);
            return null;
          }
          const stack = await getStack(env.STACKS_DIR, entry.name);
          return stack;
        } catch (error) {
          logger.error(`Failed to get stack ${entry.name}:`, error);
          return null;
        }
      });

    const stackList = (await Promise.all(stackPromises))
      .filter((stack): stack is Stack => stack !== null)
      .sort(
        (a, b) => SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status),
      );

    updateCachedStackList(stackList);
    broadcastToAll("stackList", stackList);
    return stackList;
  } catch (error) {
    logger.error("Failed to send stack list:", error);
    socket.emit("stackList", []);
    throw error; // Re-throw for upstream handling
  }
};

export const sendStackLogs = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
  data: { composeName: string },
) => {
  let ptyProcess: ReturnType<typeof spawnTerminal> | undefined;

  try {
    ptyProcess = spawnTerminal(
      data.composeName,
      "docker compose logs -f --tail 100",
    );

    ptyProcess.onData((data) => {
      socket.emit("stackLogs", data);
    });

    socket.on("disconnect", () => {
      ptyProcess?.kill();
    });
  } catch (error) {
    logger.error(`Failed to send stack logs for ${data.composeName}:`, error);
    socket.emit("error", { message: "Failed to fetch logs" });
    ptyProcess?.kill();
  }
};

export const onCreateStack = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("createStack", async ({ composeName }, callback) => {
    const existingStacks = await fs.readdir(env.STACKS_DIR, {
      withFileTypes: true,
      encoding: "utf-8",
    });

    const validateName = /^[a-z0-9-_]+$/.exec(composeName);
    if (!validateName) {
      return callback({
        status: "error",
        message: "Invalid stack name",
      });
    }

    const isNameUnique = existingStacks.every(
      (entry) => entry.name !== composeName,
    );
    if (!isNameUnique) {
      return callback({
        status: "error",
        message: "Stack name must be unique",
      });
    }

    await fs.mkdir(`${env.STACKS_DIR}/${composeName}`);
    await fs.writeFile(
      `${env.STACKS_DIR}/${composeName}/${COMPOSE_FILE_NAME}`,
      `services:
  whoami:
    image: traefik/whoami`,
    );
    void sendStackList(socket);
    return callback({
      status: "success",
      message: "Created successfully",
    });
  });
};

export const onSaveCompose = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("saveCompose", async ({ composeName, composeFile }, callback) => {
    try {
      await dockerCompose.config({
        configAsString: composeFile,
      });
    } catch (error) {
      return callback({
        status: "error",
        message: (error as DockerComposeError).err,
      });
    }

    try {
      await fs.writeFile(
        `${env.STACKS_DIR}/${composeName}/${COMPOSE_FILE_NAME}`,
        composeFile,
      );
      void sendStackList(socket);
      return callback({
        status: "success",
        message: "Compose file saved successfully",
      });
    } catch (error) {
      return callback({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export const onSaveEnv = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("saveEnv", async ({ composeName, envFile }, callback) => {
    try {
      await fs.writeFile(
        `${env.STACKS_DIR}/${composeName}/${ENV_FILE_NAME}`,
        envFile,
      );
      void sendStackList(socket);
      return callback({
        status: "success",
        message: "Env file saved successfully",
      });
    } catch (error) {
      return callback({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export const onRemoveStack = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("removeStack", async ({ composeName }, callback) => {
    try {
      await dockerCompose.down({
        cwd: `${env.STACKS_DIR}/${composeName}`,
      });
    } catch (error) {
      return callback({
        status: "error",
        message: (error as DockerComposeError).err,
      });
    }

    try {
      await fs.rm(`${env.STACKS_DIR}/${composeName}`, {
        recursive: true,
      });
      void sendStackList(socket);
      return callback({
        status: "success",
        message: "Removed successfully",
      });
    } catch (error) {
      return callback({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export const onStackList = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("stackList", () => {
    const cachedList = getCachedStackList();
    void sendStackList(socket, cachedList !== null && cachedList.length > 0);
  });
};

export const onStackLogs = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("stackLogs", (data) => {
    void sendStackLogs(socket, data);
  });
};

export const onStackCommand = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("stackCommand", ({ composeName, command }, callback) => {
    if (command === "deploy") {
      const ptyProcess = spawnTerminal(
        composeName,
        "docker compose up -d --remove-orphans",
      );

      let error = "";

      ptyProcess.onData((data) => {
        error = data;
        socket.emit("stackCommand", data);
      });

      ptyProcess.onExit((code) => {
        if (code.exitCode === 0) {
          void sendStackList(socket);
          void sendStackLogs(socket, { composeName });
          return callback({
            status: "success",
            message: "Deployed successfully",
          });
        } else {
          return callback({
            status: "error",
            message: error,
          });
        }
      });

      socket.on("disconnect", () => {
        ptyProcess.kill();
      });
    }

    if (command === "down") {
      const ptyProcess = spawnTerminal(
        composeName,
        "docker compose down --remove-orphans",
      );

      ptyProcess.onData((data) => {
        socket.emit("stackCommand", data);
      });

      ptyProcess.onExit((code) => {
        if (code.exitCode === 0) {
          void sendStackList(socket);
          void sendStackLogs(socket, { composeName });
          return callback({
            status: "success",
            message: "Downed successfully",
          });
        } else {
          return callback({
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
};

// Add connection handling at the start of your socket setup
export const handleConnection = (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  addSocket(socket);

  socket.on("disconnect", () => {
    removeSocket(socket);
  });

  // Initialize the client with current data
  void sendStackList(socket, true);
};
