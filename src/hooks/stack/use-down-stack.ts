import { useState } from "react";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useDownStack() {
  const [status, setStatus] = useState<Status>("idle");

  const down = (data: { composeName: string }, options?: BaseOptions) => {
    setStatus("loading");
    stackSocket.emit(
      "stackCommand",
      { composeName: data.composeName, command: "down" },
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
    down,
  };
}
