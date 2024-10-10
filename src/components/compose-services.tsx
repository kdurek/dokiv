"use client";

import { Badge } from "@/components/ui/badge";
import { stackListAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import type { Stack } from "@/server/api/utils";
import { useAtomValue } from "jotai";

export function ComposeServices({ composeName }: { composeName: string }) {
  const stackList = useAtomValue(stackListAtom);
  const stack = stackList.find((stack) => stack.name === composeName);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Services</h2>
      {stack &&
        Object.entries(stack.parsedStackFile.services)?.map(
          ([key, service]) => (
            <div key={key} className="rounded-md border p-4">
              <div>{key}</div>
              <div className="text-muted-foreground">{service.image}</div>
              <ServiceStatus composeName={composeName} stack={stack} />
            </div>
          ),
        )}
    </div>
  );
}

function ServiceStatus({
  composeName,
  stack,
}: {
  composeName: string;
  stack: Stack;
}) {
  const service = stack?.services.find((service) =>
    service.name.includes(composeName),
  );

  return (
    <Badge
      variant="outline"
      className={cn("bg-gray-500 text-white", {
        "bg-green-500":
          service?.status === "running" || service?.status === "healthy",
        "bg-red-500": service?.status === "exited",
      })}
    >
      {service?.status ?? "unknown"}
    </Badge>
  );
}
