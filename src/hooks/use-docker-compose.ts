"use client";

import { composeValueAtom, isEditingAtom } from "@/lib/atoms";
import {
  dockerComposeCommandSocket,
  dockerComposeLogsSocket,
  stackListSocket,
} from "@/lib/socket";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useDockerCompose({ composeName }: { composeName: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const router = useRouter();
  const value = useAtomValue(composeValueAtom);
  const setIsEditing = useSetAtom(isEditingAtom);

  const create = async (onSuccess: () => void) => {
    setStatus("loading");
    stackListSocket.emit("createStack", { composeName }, async (callback) => {
      if (callback.status === "success") {
        onSuccess();
        setStatus("success");
        toast.success(callback.message);
      }
      if (callback.status === "error") {
        setStatus("error");
        toast.error(callback.message);
      }
    });
  };

  const save = async () => {
    setStatus("loading");
    stackListSocket.emit(
      "saveStack",
      { composeName, stack: value },
      async (callback) => {
        if (callback.status === "success") {
          setIsEditing(false);
          setStatus("success");
          toast.success(callback.message);
        }
        if (callback.status === "error") {
          setStatus("error");
          toast.error(callback.message);
        }
      },
    );
  };

  const deploy = () => {
    setStatus("loading");
    dockerComposeCommandSocket.emit(
      "output",
      { composeName, command: "deploy" },
      async (callback) => {
        if (callback.status === "success") {
          stackListSocket.emit("refresh");
          dockerComposeLogsSocket.emit("output", { composeName });
          setStatus("success");
          toast.success(callback.message);
        }
        if (callback.status === "error") {
          setStatus("error");
          toast.error(callback.message);
        }
      },
    );
  };

  const saveAndDeploy = () => {
    setStatus("loading");
    stackListSocket.emit(
      "saveStack",
      { composeName, stack: value },
      async (callback) => {
        if (callback.status === "success") {
          dockerComposeCommandSocket.emit(
            "output",
            { composeName, command: "deploy" },
            async (callback) => {
              if (callback.status === "success") {
                setIsEditing(false);
                stackListSocket.emit("refresh");
                dockerComposeLogsSocket.emit("output", { composeName });
                setStatus("success");
                toast.success(callback.message);
              }
              if (callback.status === "error") {
                setStatus("error");
                toast.error(callback.message);
              }
            },
          );
        }
        if (callback.status === "error") {
          setStatus("error");
          toast.error(callback.message);
        }
      },
    );
  };

  const down = () => {
    setStatus("loading");
    dockerComposeCommandSocket.emit(
      "output",
      { composeName, command: "down" },
      async (callback) => {
        if (callback.status === "success") {
          stackListSocket.emit("refresh");
          dockerComposeLogsSocket.emit("output", { composeName });
          setStatus("success");
          toast.success(callback.message);
        }
        if (callback.status === "error") {
          setStatus("error");
          toast.error(callback.message);
        }
      },
    );
  };

  const remove = () => {
    setStatus("loading");
    router.push("/");
    stackListSocket.emit("removeStack", { composeName }, async (callback) => {
      if (callback.status === "success") {
        setStatus("success");
        toast.success(callback.message);
      }
      if (callback.status === "error") {
        setStatus("error");
        toast.error(callback.message);
      }
    });
  };

  return {
    status,
    create,
    save,
    deploy,
    saveAndDeploy,
    down,
    remove,
  };
}
