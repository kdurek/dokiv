"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function ComposeServices({ composeName }: { composeName: string }) {
  const [parsedStack] = api.compose.getParsedStackFile.useSuspenseQuery({
    composeName,
  });

  return (
    <div className="flex w-80 flex-col gap-4">
      <h2 className="text-2xl">Services</h2>
      {Object.entries(parsedStack.services)?.map(([key, service]) => (
        <div key={key} className="rounded-md border p-4">
          <div>{key}</div>
          <div className="text-muted-foreground">{service.image}</div>
          <ServiceStatus composeName={composeName} />
        </div>
      ))}
    </div>
  );
}

function ServiceStatus({ composeName }: { composeName: string }) {
  const [containersByName] = api.compose.containersByName.useSuspenseQuery({
    composeName,
  });

  const service = containersByName.find((container) =>
    container.name.includes(composeName),
  );

  return (
    <Badge
      variant="outline"
      className={cn("bg-gray-500 text-white", {
        "bg-green-500": service?.state === "running",
        "bg-red-500": service?.state === "exited",
      })}
    >
      {service?.state ?? "unknown"}
    </Badge>
  );
}
