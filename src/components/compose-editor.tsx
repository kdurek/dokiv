"use client";

import { Button } from "@/components/ui/button";
import { useSaveCompose } from "@/hooks/stack/use-save-compose";
import { stackListAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
  },
);

export function ComposeEditor({ composeName }: { composeName: string }) {
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);
  const { saveCompose, status } = useSaveCompose();
  const [composeFile, setComposeFile] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!stack) return;
    setComposeFile(stack.stackFile);
  }, [setComposeFile, stack]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {isEditing && (
          <Button
            onClick={() =>
              saveCompose(
                {
                  composeName,
                  composeFile,
                },
                {
                  onSuccess: () => setIsEditing(false),
                },
              )
            }
            disabled={status === "loading"}
          >
            Save
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => setIsEditing((prev) => !prev)}
          disabled={status === "loading"}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <CodeEditor
        value={composeFile}
        onChange={setComposeFile}
        editable={isEditing}
      />
    </div>
  );
}
