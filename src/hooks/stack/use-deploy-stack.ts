import { useState } from "react";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useDeployStack() {
  const [status, setStatus] = useState<Status>("idle");

  const deploy = (data: { composeName: string }, options?: BaseOptions) => {
    setStatus("loading");
    stackSocket.emit(
      "stackCommand",
      { composeName: data.composeName, command: "deploy" },
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
    deploy,
  };
}
