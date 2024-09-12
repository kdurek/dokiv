"use client";

import { ActionsRemove } from "@/components/actions-remove";
import { Button } from "@/components/ui/button";
import { composeValueAtom, isEditingAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
import { useAtom } from "jotai";
import { toast } from "sonner";

export function ComposeActions({ name }: { name: string }) {
  const [stack] = api.compose.getStackFile.useSuspenseQuery({ name });
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const [value, setValue] = useAtom(composeValueAtom);

  const deploy = api.compose.up.useMutation();
  const down = api.compose.down.useMutation();
  const save = api.compose.saveStackFile.useMutation();

  const handleDeploy = () => {
    toast.promise(
      deploy.mutateAsync({
        name,
      }),
      {
        loading: "Deploying...",
        success: "Deployed successfully",
        error: "Failed to deploy",
      },
    );
  };

  const handleDown = () => {
    toast.promise(
      down.mutateAsync({
        name,
      }),
      {
        loading: "Downing...",
        success: "Downed successfully",
        error: "Error",
      },
    );
  };

  const handleSave = () => {
    toast.promise(save.mutateAsync({ name, stack: value }), {
      loading: "Saving...",
      success: () => {
        setIsEditing(false);
        return "Saved successfully";
      },
      error: (error: Error) => {
        return error.message;
      },
    });
  };

  const handleSaveAndDeploy = () => {
    toast.promise(save.mutateAsync({ name, stack: value }), {
      loading: "Saving...",
      success: () => {
        setIsEditing(false);
        return "Saved successfully";
      },
      error: (error: Error) => {
        return error.message;
      },
    });
    toast.promise(
      deploy.mutateAsync({
        name,
      }),
      {
        loading: "Deploying...",
        success: "Deployed successfully",
        error: "Failed to deploy",
      },
    );
  };

  const handleCancel = () => {
    setValue(stack);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <Button
            onClick={handleSaveAndDeploy}
            disabled={save.isPending || deploy.isPending}
          >
            Deploy
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={save.isPending}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleDeploy} disabled={deploy.isPending}>
            Deploy
          </Button>
          <Button variant="secondary" onClick={handleDown}>
            Down
          </Button>
          <Button variant="secondary" onClick={handleEdit}>
            Edit
          </Button>
        </>
      )}
      <ActionsRemove name={name} />
    </div>
  );
}
