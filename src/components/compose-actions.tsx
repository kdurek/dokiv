"use client";

import { ActionsRemove } from "@/components/actions-remove";
import { Button } from "@/components/ui/button";
import { useDockerCompose } from "@/hooks/useDockerCompose";
import { composeValueAtom, isEditingAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
import { useAtom, useSetAtom } from "jotai";

export function ComposeActions({ composeName }: { composeName: string }) {
  const [stack] = api.compose.getStackFile.useSuspenseQuery({
    composeName,
  });
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const setValue = useSetAtom(composeValueAtom);
  const { status, save, deploy, saveAndDeploy, down } = useDockerCompose({
    composeName,
  });

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
          <Button onClick={saveAndDeploy} disabled={status === "loading"}>
            Deploy
          </Button>
          <Button
            variant="secondary"
            onClick={save}
            disabled={status === "loading"}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={deploy} disabled={status === "loading"}>
            Deploy
          </Button>
          <Button
            variant="secondary"
            onClick={down}
            disabled={status === "loading"}
          >
            Down
          </Button>
          <Button variant="secondary" onClick={handleEdit}>
            Edit
          </Button>
        </>
      )}
      <ActionsRemove composeName={composeName} />
    </div>
  );
}
