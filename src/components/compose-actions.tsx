"use client";

import { ActionsRemove } from "@/components/actions-remove";
import { Button } from "@/components/ui/button";
import { useDockerCompose } from "@/hooks/use-docker-compose";
import { stackValueAtom, isEditingAtom, stackListAtom } from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

export function ComposeActions({ composeName }: { composeName: string }) {
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const setStackValue = useSetAtom(stackValueAtom);
  const { status, save, deploy, saveAndDeploy, down, remove } =
    useDockerCompose({
      composeName,
    });

  const handleCancel = () => {
    if (!stack) return;

    setStackValue(stack.stackFile);
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
      <ActionsRemove onClick={remove} />
    </div>
  );
}
