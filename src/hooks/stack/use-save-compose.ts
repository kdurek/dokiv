import { useState } from "react";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useSaveCompose() {
  const [status, setStatus] = useState<Status>("idle");

  const saveCompose = async (
    data: { composeName: string; composeFile: string },
    options?: BaseOptions,
  ) => {
    setStatus("loading");
    stackSocket.emit(
      "saveCompose",
      { composeName: data.composeName, composeFile: data.composeFile },
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
    saveCompose,
  };
}
