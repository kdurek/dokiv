import { useState } from "react";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useCreateStack() {
  const [status, setStatus] = useState<Status>("idle");

  const create = async (data: { name: string }, options?: BaseOptions) => {
    setStatus("loading");
    stackSocket.emit("createStack", { composeName: data.name }, (callback) =>
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
    create,
  };
}
