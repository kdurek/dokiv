import { COMPOSE_FILE_NAME, COMPOSE_FILE_NAMES } from "@/server/consts";
import path from "path";
import fs from "fs";
import fsAsync from "fs/promises";
import { dockerCompose } from "@/server/docker";
import type { DockerComposePsResultService } from "docker-compose/dist/v2";
import { parse } from "yaml";
import type { DockerCompose } from "@/lib/types";

export type Stack = {
  name: string;
  status: DockerComposePsResultService["state"];
  services: {
    name: DockerComposePsResultService["name"];
    status: DockerComposePsResultService["state"];
  }[];
  stackFile: string;
  parsedStackFile: DockerCompose;
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

export async function getStackFile(stackDir: string, stackName: string) {
  return fsAsync.readFile(
    `${stackDir}/${stackName}/${COMPOSE_FILE_NAME}`,
    "utf-8",
  );
}

export async function getStack(
  stackDir: string,
  stackName: string,
): Promise<Stack> {
  const composeList = await dockerCompose.ps({
    cwd: `${stackDir}/${stackName}`,
    commandOptions: [["--format", "json"]],
  });

  const services: Stack["services"] = composeList.data.services.map(
    (service) => ({
      name: service.name,
      status: service.state,
    }),
  );

  const stackFile = await getStackFile(stackDir, stackName);

  const parsedStackFile = parse(stackFile) as DockerCompose;

  return {
    name: stackName,
    status: getStackServicesStatus(services),
    services,
    stackFile,
    parsedStackFile,
  };
}
