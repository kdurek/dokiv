import { useState } from "react";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useSaveEnv() {
  const [status, setStatus] = useState<Status>("idle");

  const saveEnv = async (
    data: { composeName: string; envFile: string },
    options?: BaseOptions,
  ) => {
    setStatus("loading");
    stackSocket.emit(
      "saveEnv",
      { composeName: data.composeName, envFile: data.envFile },
      (callback) =>
        handleSocketResponse(
          callback,
          setStatus,
          () => options?.onSuccess?.(),
          () => options?.onError?.(),
        ),
    );
  };

  return {
    status,
    saveEnv,
  };
}
