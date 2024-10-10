"use client";

import { ComposeCreate } from "@/components/compose-create";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetClose } from "@/components/ui/sheet";
import { stackListAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment } from "react";

export function Sidebar({ withSheetClose }: { withSheetClose?: boolean }) {
  const params = useParams();
  const stackList = useAtomValue(stackListAtom);
  const [SheetCloseWrapper, sheetCloseWrapperProps] = withSheetClose
    ? [SheetClose, { asChild: true }]
    : [Fragment, {}];

  return (
    <div className="flex size-full flex-col border-r">
      <div className="p-4">
        <ComposeCreate />
      </div>
      <ScrollArea>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {stackList.map((stack) => (
            <SheetCloseWrapper key={stack.name} {...sheetCloseWrapperProps}>
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
            </SheetCloseWrapper>
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
