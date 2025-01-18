import { toast } from "sonner";
import { type SocketCallback, type Status } from "./types";

export const handleSocketResponse = (
  callback: SocketCallback,
  setStatus: (status: Status) => void,
  onSuccess?: () => void,
  onError?: () => void,
) => {
  if (callback.status === "success") {
    onSuccess?.();
    setStatus("success");
    toast.success(callback.message);
  } else {
    onError?.();
    setStatus("error");
    toast.error(callback.message);
  }
};
