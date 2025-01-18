"use client";

type Status = "idle" | "loading" | "success" | "error";
type SocketCallback = {
  status: "success" | "error";
  message: string;
};

import { stackSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const handleSocketResponse = (
  callback: SocketCallback,
  setStatus: (status: "idle" | "loading" | "success" | "error") => void,
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

export function useDockerCompose() {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();

  const create = async (
    data: {
      name: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => {
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

  const saveCompose = async (
    data: {
      composeName: string;
      composeFile: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
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

  const saveEnv = async (
    data: {
      composeName: string;
      envFile: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
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

  const deploy = (
    data: { composeName: string },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => {
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

  const down = (
    data: { composeName: string },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => {
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

  const remove = (
    data: { composeName: string },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => {
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
    create,
    saveCompose,
    saveEnv,
    deploy,
    down,
    remove,
    isLoading: status === "loading",
    isError: status === "error",
  };
}
