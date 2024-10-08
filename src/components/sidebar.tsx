"use client";

import { ComposeCreate } from "@/components/compose-create";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { stackListAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";

export function Sidebar() {
  const params = useParams();
  const stackList = useAtomValue(stackListAtom);

  return (
    <div className="flex w-80 flex-col border-r">
      <div className="p-4">
        <ComposeCreate />
      </div>
      <ScrollArea>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {stackList.map((stack) => (
            <Link
              key={stack.name}
              href={`/compose/${stack.name}`}
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "w-full justify-between",
                params?.name === stack.name && "bg-accent",
              )}
            >
              {stack.name}
              <StackStatus status={stack.status} />
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function StackStatus({ status }: { status: string }) {
  return (
    <div
      className={cn("size-4 rounded-full bg-gray-500", {
        "bg-green-500": status === "running",
        "bg-red-500": status === "exited",
      })}
    />
  );
}
