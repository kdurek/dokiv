import { env } from "@/env";
import { composeFileExists, getStack } from "@/server/api/utils";
import { COMPOSE_FILE_NAME, SORT_ORDER } from "@/server/consts";
import { dockerCompose, type DockerComposeError } from "@/server/docker";
import type {
  StackClientToServerEvents,
  StackServerToClientEvents,
} from "@/server/wss/stack";
import { cachedStackList, updateCachedStackList } from "@/server/wss/cache";
import { spawnTerminal } from "@/server/wss/utils";
import fs from "node:fs/promises";
import type { Socket } from "socket.io";

export const sendStackList = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
  cache = false,
) => {
  if (cache) {
    socket.emit("stackList", cachedStackList);
    return;
  }

  try {
    const entries = (
      await fs.readdir(env.STACKS_DIR, {
        withFileTypes: true,
        encoding: "utf-8",
      })
    ).filter((entry) => entry.isDirectory());
    const stackList = await Promise.all(
      entries.map(async (entry) => {
        try {
          // Skip if the directory does not contain a compose file
          if (!(await composeFileExists(env.STACKS_DIR, entry.name))) {
            return;
          }
          return getStack(env.STACKS_DIR, entry.name);
        } catch (error) {
          console.error((error as Error).message);
        }
      }),
    );
    const result = stackList
      .filter((stack) => stack !== undefined)
      .sort(
        (a, b) => SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status),
      );
    updateCachedStackList(result);
    socket.emit("stackList", result);
    return result;
  } catch (error) {
    console.error((error as Error).message);
  }
};

export const createStack = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("createStack", async ({ composeName }, callback) => {
    const existingStacks = await fs.readdir(env.STACKS_DIR, {
      withFileTypes: true,
      encoding: "utf-8",
    });
    const isNameUnique = existingStacks.every(
      (entry) => entry.name !== composeName,
    );
    if (!isNameUnique) {
      callback({
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
    callback({
      status: "success",
      message: "Created successfully",
    });
  });
};

export const saveStack = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("saveStack", async ({ composeName, stack }, callback) => {
    try {
      await dockerCompose.config({
        configAsString: stack,
      });
    } catch (error) {
      callback({
        status: "error",
        message: (error as DockerComposeError).err,
      });
    }

    try {
      await fs.writeFile(
        `${env.STACKS_DIR}/${composeName}/${COMPOSE_FILE_NAME}`,
        stack,
      );
      void sendStackList(socket);
      callback({
        status: "success",
        message: "Saved successfully",
      });
    } catch (error) {
      callback({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export const removeStack = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("removeStack", async ({ composeName }, callback) => {
    try {
      await dockerCompose.down({
        cwd: `${env.STACKS_DIR}/${composeName}`,
      });
    } catch (error) {
      callback({
        status: "error",
        message: (error as DockerComposeError).err,
      });
    }

    try {
      await fs.rm(`${env.STACKS_DIR}/${composeName}`, {
        recursive: true,
      });
      callback({
        status: "success",
        message: "Removed successfully",
      });
      void sendStackList(socket);
    } catch (error) {
      callback({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export const stackLogs = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("stackLogs", (data) => {
    const ptyProcess = spawnTerminal(
      data.composeName,
      "docker compose logs -f",
    );

    ptyProcess.onData((data) => {
      socket.emit("stackLogs", data);
    });

    socket.on("disconnect", () => {
      ptyProcess.kill();
    });
  });
};

export const stackCommand = async (
  socket: Socket<StackClientToServerEvents, StackServerToClientEvents>,
) => {
  socket.on("stackCommand", (data, callback) => {
    if (data.command === "deploy") {
      const ptyProcess = spawnTerminal(
        data.composeName,
        "docker compose up -d --remove-orphans",
      );

      ptyProcess.onData((data) => {
        socket.emit("stackCommand", data);
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
        socket.emit("stackCommand", data);
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
};
