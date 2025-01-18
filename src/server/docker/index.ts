import Docker from "dockerode";
import compose from "docker-compose";

export const docker = new Docker();

export const dockerCompose = compose;

export type DockerComposeError = {
  err: string;
};
