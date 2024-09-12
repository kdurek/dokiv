"use client";

import { ComposeCreate } from "@/components/compose-create";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useParams } from "next/navigation";

const SORT_ORDER = ["running", "exited", "unknown"];

export function Sidebar() {
  const params = useParams();
  const [stacks] = api.compose.listStacks.useSuspenseQuery();

  return (
    <div className="flex w-80 flex-col gap-2 border-r p-4">
      <ComposeCreate />
      {stacks
        .sort((a, b) => {
          return SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status);
        })
        .map((stack) => (
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
