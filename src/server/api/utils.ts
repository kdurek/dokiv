import { COMPOSE_FILE_NAMES } from "@/server/consts";
import path from "path";
import fs from "fs";
import { dockerCompose } from "@/server/docker";
import type { DockerComposePsResultService } from "docker-compose/dist/v2";

export type Stack = {
  name: string;
  status: DockerComposePsResultService["state"];
  services: {
    name: DockerComposePsResultService["name"];
    status: DockerComposePsResultService["state"];
  }[];
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

export function getStackServicesStatus(services: Stack["services"]) {
  if (
    services.length &&
    services.every((service) => service.status === "running")
  ) {
    return "running";
  }
  if (
    services.length &&
    services.some((service) => service.status === "exited")
  ) {
    return "exited";
  }
  return "unknown";
}

export async function getStack(
  stackDir: string,
  stackName: string,
): Promise<Stack> {
  const composeList = await dockerCompose.ps({
    cwd: `${stackDir}/${stackName}`,
    commandOptions: [["--format", "json"]],
  });

  const services: Stack["services"] = [];

  for (const service of composeList.data.services) {
    services.push({
      name: service.name,
      status: service.state,
    });
  }

  return {
    name: stackName,
    status: getStackServicesStatus(services),
    services,
  };
}
