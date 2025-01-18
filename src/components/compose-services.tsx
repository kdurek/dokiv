"use client";

import { ActionsRemove } from "@/components/actions-remove";
import { ComposeCommand } from "@/components/compose-command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeployStack } from "@/hooks/stack/use-deploy-stack";
import { useDownStack } from "@/hooks/stack/use-down-stack";
import { stackListAtom } from "@/lib/atoms";
import type { DockerService } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Stack } from "@/server/utils";
import { useAtomValue } from "jotai";
import { memo } from "react";

export function ComposeServices({ composeName }: { composeName: string }) {
  const stackList = useAtomValue(stackListAtom);
  const { status: deployStatus, deploy } = useDeployStack();
  const { status: downStatus, down } = useDownStack();

  const stack = stackList.find((stack) => stack.name === composeName);
  const services = stack?.parsedStackFile.services
    ? Object.entries(stack.parsedStackFile.services)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            deploy({
              composeName,
            })
          }
          disabled={deployStatus === "loading"}
        >
          Deploy
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            down({
              composeName,
            })
          }
          disabled={downStatus === "loading"}
        >
          Down
        </Button>
        <ActionsRemove composeName={composeName} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stack &&
          services.map(([key, service]) => (
            <ServiceCard
              key={key}
              name={key}
              service={service}
              composeName={composeName}
              stack={stack}
            />
          ))}
      </div>
      <ComposeCommand composeName={composeName} />
    </div>
  );
}

const ServiceCard = memo(function ServiceCard({
  name,
  service,
  composeName,
  stack,
}: {
  name: string;
  service: DockerService;
  composeName: string;
  stack: Stack;
}) {
  return (
    <div key={name} className="rounded-md border p-4">
      <div>{name}</div>
      <div className="text-muted-foreground">{service.image}</div>
      <ServiceStatus composeName={composeName} stack={stack} />
    </div>
  );
});

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
