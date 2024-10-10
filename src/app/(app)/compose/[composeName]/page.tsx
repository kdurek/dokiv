import { ComposeActions } from "@/components/compose-actions";
import { ComposeCommand } from "@/components/compose-command";
import { ComposeEditor } from "@/components/compose-editor";
import { ComposeLogs } from "@/components/compose-logs";
import { ComposeServices } from "@/components/compose-services";
import { EnvEditor } from "@/components/env-editor";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  params: { composeName },
}: {
  params: { composeName: string };
}) {
  return (
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap justify-between gap-4">
        <h2 className="text-4xl">{composeName}</h2>
        <ComposeActions composeName={composeName} />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-80">
          <ComposeServices composeName={composeName} />
        </div>
        <div className="flex flex-col gap-4 lg:flex-1">
          <ComposeEditor composeName={composeName} />
          <EnvEditor composeName={composeName} />
        </div>
      </div>
      <ComposeCommand composeName={composeName} />
      <ComposeLogs composeName={composeName} />
    </main>
  );
}
