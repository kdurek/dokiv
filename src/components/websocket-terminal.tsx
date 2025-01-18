"use client";

import { stackSocket } from "@/lib/socket";
import { useEffect, useCallback } from "react";

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

  const handleWrite = useCallback(
    (data: string) => {
      instance?.write(data);
    },
    [instance],
  );

  useEffect(() => {
    if (!instance) return;

    if (type === "logs") {
      stackSocket.emit("stackLogs", { composeName });
      stackSocket.on("stackLogs", handleWrite);
      return () => {
        stackSocket.off("stackLogs", handleWrite);
      };
    }

    stackSocket.on("stackCommand", handleWrite);
    return () => {
      stackSocket.off("stackCommand", handleWrite);
    };
  }, [composeName, type, instance, handleWrite]);

  return (
    <div className="overflow-hidden rounded-md border p-4 pr-0">
      <div ref={ref} />
    </div>
  );
}
