"use client";

import dynamic from "next/dynamic";

const WebsocketTerminal = dynamic(
  () =>
    import("@/components/websocket-terminal").then(
      (mod) => mod.WebsocketTerminal,
    ),
  {
    ssr: false,
  },
);

export function ComposeCommand({ composeName }: { composeName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Command</h2>
      <WebsocketTerminal type="command" composeName={composeName} />
    </div>
  );
}
