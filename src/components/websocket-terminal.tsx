"use client";

import { stackSocket } from "@/lib/socket";
import { useEffect } from "react";

import { useTerminal } from "@/hooks/use-terminal";
import "@xterm/xterm/css/xterm.css";

export function WebsocketTerminal({
  type,
  composeName,
}: {
  type: "command" | "logs";
  composeName: string;
}) {
  const { ref, instance } = useTerminal();

  useEffect(() => {
    if (instance) {
      if (type === "command") {
        stackSocket.on("stackCommand", (data) => {
          instance.write(data);
        });
      }

      if (type === "logs") {
        stackSocket.emit("stackLogs", {
          composeName,
        });
        stackSocket.on("stackLogs", (data) => {
          instance.write(data);
        });
      }
    }
  }, [composeName, type, instance]);

  return (
    <div className="overflow-hidden rounded-md border p-4 pr-0">
      <div ref={ref} />
    </div>
  );
}
