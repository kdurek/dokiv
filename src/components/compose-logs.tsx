"use client";

import { api } from "@/trpc/react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@xterm/xterm/css/xterm.css";

export function ComposeLogs({ name }: { name: string }) {
  const [service, setService] = useState("");
  const [containersByName] = api.compose.containersByName.useSuspenseQuery({
    name,
  });
  const services = containersByName.map((container) => container.name);

  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);

  api.compose.subscribeLogs.useSubscription(
    {
      name,
      services: containersByName
        .filter((container) => container.name === service)
        .map((container) => container.name),
    },
    {
      onData: (data) => {
        if (terminalRef.current) {
          terminalRef.current.write(data);
        }
      },
      onError: (err) => {
        console.error("Error in log stream:", err);
      },
      enabled: containersByName.length > 0,
    },
  );

  useEffect(() => {
    if (containerRef.current) {
      terminalRef.current = new Terminal({
        rows: 10,
        cursorBlink: true,
        lineHeight: 1.4,
        convertEol: true,
        theme: {
          cursor: "transparent",
          background: "rgba(0, 0, 0, 0)",
        },
      });

      const fitAddon = new FitAddon();
      terminalRef.current.loadAddon(fitAddon);
      terminalRef.current.open(containerRef.current);
      fitAddon.fit();
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Logs</h2>
      <Tabs value={service} onValueChange={setService} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="">All</TabsTrigger>
          {services.map((service) => (
            <TabsTrigger key={service} value={service}>
              {service}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div ref={containerRef} className="rounded-md border p-4" />
    </div>
  );
}
