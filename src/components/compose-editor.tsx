"use client";

import { composeValueAtom, isEditingAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
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
  const [stack] = api.compose.getStackFile.useSuspenseQuery({ composeName });
  const [value, setValue] = useAtom(composeValueAtom);

  useEffect(() => {
    setValue(stack);
  }, [setValue, stack]);

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-2xl">Editor</h2>
      <CodeEditor value={value} onChange={setValue} editable={isEditing} />
    </div>
  );
}
