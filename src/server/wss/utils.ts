import { env } from "@/env";
import { spawn } from "node-pty";
import os from "node:os";

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

export const spawnTerminal = (composeName: string, command: string) => {
  const shell = getShell();
  const ptyProcess = spawn(shell, ["-c", command], {
    name: "xterm-256color",
    cwd: `${env.STACKS_DIR}/${composeName}`,
    env: process.env,
  });
  return ptyProcess;
};
