export type Status = "idle" | "loading" | "success" | "error";

export type SocketCallback = {
  status: "success" | "error";
  message: string;
};

export type BaseOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};
