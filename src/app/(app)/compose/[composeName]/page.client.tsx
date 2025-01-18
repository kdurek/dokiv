"use client";

import { ComposeEditor } from "@/components/compose-editor";
import { ComposeLogs } from "@/components/compose-logs";
import { ComposeServices } from "@/components/compose-services";
import { EnvEditor } from "@/components/env-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

export default function ComposePageClient({
  composeName,
}: {
  composeName: string;
}) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "services";
  const handleChangeTab = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url);
  };

  return (
    <main
      key={composeName}
      className="flex w-full max-w-[100vw] flex-1 flex-col gap-4 p-4 md:mx-auto md:max-w-[calc(100vw-16rem)]"
    >
      <Tabs defaultValue={defaultTab} onValueChange={handleChangeTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <ComposeServices composeName={composeName} />
        </TabsContent>
        <TabsContent value="compose">
          <ComposeEditor composeName={composeName} />
        </TabsContent>
        <TabsContent value="environment">
          <EnvEditor composeName={composeName} />
        </TabsContent>
        <TabsContent value="logs">
          <ComposeLogs composeName={composeName} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
