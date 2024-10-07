"use client";

import { composeValueAtom, isEditingAtom } from "@/lib/atoms";
import {
  dockerComposeCommandSocket,
  dockerComposeLogsSocket,
} from "@/lib/socket";
import { api } from "@/trpc/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useDockerCompose({ composeName }: { composeName: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const router = useRouter();
  const utils = api.useUtils();
  const saveMutation = api.compose.saveStackFile.useMutation();
  const removeMutation = api.compose.removeStackFile.useMutation();
  const value = useAtomValue(composeValueAtom);
  const setIsEditing = useSetAtom(isEditingAtom);

  const save = async () => {
    setStatus("loading");
    toast.promise(saveMutation.mutateAsync({ composeName, stack: value }), {
      loading: "Saving...",
      success: async () => {
        setIsEditing(false);
        setStatus("success");
        return "Saved successfully";
      },
      error: (error: Error) => {
        setStatus("error");
        return error.message;
      },
    });
  };

  const deploy = () => {
    setStatus("loading");
    dockerComposeCommandSocket.emit(
      "output",
      { composeName, command: "deploy" },
      async (callback) => {
        if (callback.status === "success") {
          dockerComposeLogsSocket.emit("output", { composeName });
          await utils.invalidate();
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
    toast.promise(saveMutation.mutateAsync({ composeName, stack: value }), {
      loading: "Saving...",
      success: () => {
        dockerComposeCommandSocket.emit(
          "output",
          { composeName, command: "deploy" },
          async (callback) => {
            if (callback.status === "success") {
              setIsEditing(false);
              dockerComposeLogsSocket.emit("output", { composeName });
              await utils.invalidate();
              setStatus("success");
              toast.success(callback.message);
            }
            if (callback.status === "error") {
              setStatus("error");
              toast.error(callback.message);
            }
          },
        );
        return "Saved successfully";
      },
      error: (error: Error) => {
        setStatus("error");
        toast.error(error.message);
        return error.message;
      },
    });
  };

  const down = () => {
    setStatus("loading");
    dockerComposeCommandSocket.emit(
      "output",
      { composeName, command: "down" },
      async (callback) => {
        if (callback.status === "success") {
          dockerComposeLogsSocket.emit("output", { composeName });
          await utils.invalidate();
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
    toast.promise(removeMutation.mutateAsync({ composeName }), {
      loading: "Removing...",
      success: () => {
        setStatus("success");
        return "Removed successfully";
      },
      error: (error: Error) => {
        setStatus("error");
        return error.message;
      },
    });
  };

  return {
    status,
    save,
    deploy,
    saveAndDeploy,
    down,
    remove,
  };
}
