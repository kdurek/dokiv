"use client";

import { envValueAtom, isEditingAtom, stackListAtom } from "@/lib/atoms";
import { useAtom, useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
  },
);

export function EnvEditor({ composeName }: { composeName: string }) {
  const isEditing = useAtomValue(isEditingAtom);
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);
  const [envValue, setEnvValue] = useAtom(envValueAtom);

  useEffect(() => {
    if (!stack) return;

    setEnvValue(stack.envFile);
  }, [setEnvValue, stack]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Env</h2>
      <CodeEditor
        language="properties"
        value={envValue}
        onChange={setEnvValue}
        editable={isEditing}
      />
    </div>
  );
}
