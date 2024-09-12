import Docker from "dockerode";
import { v2 as compose } from "docker-compose";

export const docker = new Docker();

export const dockerCompose = compose;

export type DockerComposeError = {
  err: string;
};
