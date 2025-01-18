import { COMPOSE_FILE_NAMES, ENV_FILE_NAME } from "@/server/consts";
import path from "path";
import fs from "fs";
import fsAsync from "fs/promises";
import { parse } from "yaml";
import type { DockerCompose, DockerService } from "@/lib/types";
import { execa } from "execa";

export type Stack = {
  name: string;
  state: string;
  services: DockerService[];
  stackFile: string;
  parsedStackFile: DockerCompose;
  envFile: string;
};

export function fileExists(filename: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function composeFileExists(
  stackDir: string,
  fileName: string,
): Promise<boolean> {
  const filenamePath = path.join(stackDir, fileName);
  for (const filename of COMPOSE_FILE_NAMES) {
    const composeFile = path.join(filenamePath, filename);
    if (await fileExists(composeFile)) {
      return true;
    }
  }
  return false;
}

export function getStackServicesStatus(services: DockerService[]) {
  if (
    services.length &&
    services.some((service) => service.State === "exited")
  ) {
    return "unhealthy";
  }
  if (
    services.length &&
    services.some((service) => service.State === "paused")
  ) {
    return "warning";
  }
  if (
    services.length &&
    services.every((service) => service.State === "running")
  ) {
    return "healthy";
  }
  return "unknown";
}

export async function getStackFile(stackDir: string, stackName: string) {
  for (const filename of COMPOSE_FILE_NAMES) {
    try {
      const filePath = path.join(stackDir, stackName, filename);
      if (await fileExists(filePath)) {
        return fsAsync.readFile(filePath, "utf-8");
      }
    } catch {
      continue;
    }
  }
  return "";
}

export async function getParsedStackFile(stackFile: string) {
  try {
    return parse(stackFile) as DockerCompose;
  } catch {
    return {} as DockerCompose;
  }
}

export async function getEnvFile(stackDir: string, stackName: string) {
  try {
    const envFile = await fsAsync.readFile(
      `${stackDir}/${stackName}/${ENV_FILE_NAME}`,
      "utf-8",
    );
    return envFile;
  } catch {
    return "";
  }
}

export async function getStack(
  stackDir: string,
  stackName: string,
): Promise<Stack> {
  const { stdout: servicesList } = (await execa(
    "docker",
    ["compose", "ps", "--format", "json"],
    {
      cwd: `${stackDir}/${stackName}`,
      stdout: {
        transform: function* (line: unknown) {
          if (typeof line === "string") {
            yield JSON.parse(line);
          }
        },
        objectMode: true,
      },
    },
  )) as { stdout: DockerService[] };

  const services = servicesList.map((service) => {
    return {
      Service: service.Service,
      State: service.Health === "" ? service.State : service.Health,
    };
  });

  const state = getStackServicesStatus(services);

  const stackFile = await getStackFile(stackDir, stackName);

  const envFile = await getEnvFile(stackDir, stackName);

  const parsedStackFile = await getParsedStackFile(stackFile);

  return {
    name: stackName,
    state,
    services,
    stackFile,
    parsedStackFile,
    envFile,
  };
}
