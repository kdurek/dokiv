import { ComposeActions } from "@/components/compose-actions";
import { ComposeCommand } from "@/components/compose-command";
import { ComposeEditor } from "@/components/compose-editor";
import { ComposeLogs } from "@/components/compose-logs";
import { ComposeServices } from "@/components/compose-services";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  params: { composeName },
}: {
  params: { composeName: string };
}) {
  void api.compose.getStackFile.prefetch({
    composeName,
  });
  void api.compose.getParsedStackFile.prefetch({
    composeName,
  });
  void api.compose.getStackList.prefetch();

  return (
    <HydrateClient>
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex justify-between gap-4">
          <h2 className="text-4xl">{composeName}</h2>
          <ComposeActions composeName={composeName} />
        </div>
        <div className="flex gap-4">
          <ComposeServices composeName={composeName} />
          <ComposeEditor composeName={composeName} />
        </div>
        <ComposeCommand composeName={composeName} />
        <ComposeLogs composeName={composeName} />
      </main>
    </HydrateClient>
  );
}
