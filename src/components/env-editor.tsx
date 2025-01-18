"use client";

import { Button } from "@/components/ui/button";
import { useSaveEnv } from "@/hooks/stack/use-save-env";
import { stackListAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
  },
);

export function EnvEditor({ composeName }: { composeName: string }) {
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);
  const { saveEnv, status } = useSaveEnv();
  const [envFile, setEnvFile] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!stack) return;
    setEnvFile(stack.envFile);
  }, [setEnvFile, stack]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {isEditing && (
          <Button
            onClick={() =>
              saveEnv(
                {
                  composeName,
                  envFile,
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
        language="properties"
        value={envFile}
        onChange={setEnvFile}
        editable={isEditing}
        className={cn(!isEditing && "decoration-security")}
      />
    </div>
  );
}
