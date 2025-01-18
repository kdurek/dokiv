export type DockerService = {
  Command?: string;
  CreatedAt?: string;
  ExitCode?: number;
  Health?: string;
  ID?: string;
  Image?: string;
  Labels?: string;
  LocalVolumes?: string;
  Mounts?: string;
  Name?: string;
  Names?: string;
  Networks?: string;
  Ports?: string;
  Project?: string;
  Publishers?: [
    {
      URL?: string;
      TargetPort?: number;
      PublishedPort?: number;
      Protocol?: string;
    },
  ];
  RunningFor?: string;
  Service?: string;
  Size?: string;
  State?: string;
  Status?: string;
};

export type DockerVolume = {
  driver: string;
  driver_opts: Record<string, string>;
  external: boolean;
};

export type DockerNetwork = {
  driver?: "bridge" | "host" | "none";
  external?: boolean;
};

export type DockerCompose = {
  version: string;
  services: Record<string, DockerService>;
  volumes?: Record<string, DockerVolume>;
  networks?: Record<string, DockerNetwork>;
};

export type UnknownObject = Record<string, unknown>;
