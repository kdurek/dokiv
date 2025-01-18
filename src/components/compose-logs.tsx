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

export function ComposeLogs({ composeName }: { composeName: string }) {
  return <WebsocketTerminal type="logs" composeName={composeName} />;
}
