"use client";

import {
  dockerComposeCommandSocket,
  dockerComposeLogsSocket,
} from "@/lib/socket";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";

import "@xterm/xterm/css/xterm.css";

export function WebsocketTerminal({
  type,
  composeName,
}: {
  type: "command" | "logs";
  composeName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const terminal = new Terminal({
        rows: 10,
        lineHeight: 1.4,
        convertEol: true,
        theme: {
          cursor: "transparent",
          background: "rgba(0, 0, 0, 0)",
        },
      });

      const fitAddon = new FitAddon();

      terminal.loadAddon(fitAddon);
      terminal.open(containerRef.current);

      fitAddon.fit();

      if (type === "command") {
        dockerComposeCommandSocket.on("output", (data) => {
          terminal.write(data);
        });
      }

      if (type === "logs") {
        dockerComposeLogsSocket.emit("output", {
          composeName,
        });
        dockerComposeLogsSocket.on("output", (data) => {
          terminal.write(data);
        });
      }

      return () => {
        terminal.dispose();
      };
    }
  }, [composeName, type]);

  return <div ref={containerRef} className="rounded-md border p-4" />;
}
