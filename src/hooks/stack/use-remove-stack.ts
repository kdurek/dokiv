import { useState } from "react";
import { useRouter } from "next/navigation";
import { stackSocket } from "@/lib/socket";
import { type BaseOptions, type Status } from "./types";
import { handleSocketResponse } from "./utils";

export function useRemoveStack() {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();

  const remove = (data: { composeName: string }, options?: BaseOptions) => {
    setStatus("loading");
    router.push("/");
    stackSocket.emit(
      "removeStack",
      { composeName: data.composeName },
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
    remove,
  };
}
