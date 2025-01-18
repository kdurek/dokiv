import { env } from "@/env";
import { spawn, type IPty } from "node-pty";
import os from "node:os";
import { logger } from "@/server/utils/logger";
import type { Socket } from "socket.io";

// Track active PTY processes for cleanup
const activeProcesses = new Set<IPty>();

// Track connected clients
const connectedSockets = new Set<Socket>();

// Debounce utility
export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const addSocket = (socket: Socket) => {
  connectedSockets.add(socket);
};

export const removeSocket = (socket: Socket) => {
  connectedSockets.delete(socket);
};

export const broadcastToAll = (event: string, data: unknown) => {
  connectedSockets.forEach((socket) => {
    socket.emit(event, data);
  });
};

export const getShell = () => {
  switch (os.platform()) {
    case "win32":
      return "powershell.exe";
    case "darwin":
      return "zsh";
    default:
      return "bash";
  }
};

// Optimize process spawning with pooling
const processPool = new Map<string, IPty>();

export const spawnTerminal = (composeName: string, command: string) => {
  const key = `${composeName}:${command}`;

  if (processPool.has(key)) {
    return processPool.get(key)!;
  }

  const shell = getShell();
  const ptyProcess = spawn(shell, ["-c", command], {
    name: "xterm-256color",
    cwd: `${env.STACKS_DIR}/${composeName}`,
    env: process.env,
  });

  processPool.set(key, ptyProcess);
  activeProcesses.add(ptyProcess);

  ptyProcess.onExit(() => {
    activeProcesses.delete(ptyProcess);
    processPool.delete(key);
  });

  // Handle errors
  ptyProcess.onData((data) => {
    if (data.toLowerCase().includes("error")) {
      logger.error(`PTY process error: ${data}`);
    }
  });

  return ptyProcess;
};

// Cleanup function for graceful shutdown
export const cleanupPtyProcesses = () => {
  activeProcesses.forEach((process) => {
    try {
      process.kill();
    } catch (error) {
      logger.error("Failed to kill PTY process:", error);
    }
  });
  activeProcesses.clear();
};
