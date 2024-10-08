"use client";

import { composeValueAtom, isEditingAtom, stackListAtom } from "@/lib/atoms";
import { useAtom, useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
  },
);

export function ComposeEditor({ composeName }: { composeName: string }) {
  const isEditing = useAtomValue(isEditingAtom);
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);
  const [value, setValue] = useAtom(composeValueAtom);

  useEffect(() => {
    if (!stack) return;

    setValue(stack.stackFile);
  }, [setValue, stack]);

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-2xl">Editor</h2>
      <CodeEditor value={value} onChange={setValue} editable={isEditing} />
    </div>
  );
}
