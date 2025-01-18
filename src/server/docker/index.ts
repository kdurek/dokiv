import compose from "docker-compose";

export const dockerCompose = compose;

export type DockerComposeError = {
  err: string;
};
