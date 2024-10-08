import { ComposeActions } from "@/components/compose-actions";
import { ComposeCommand } from "@/components/compose-command";
import { ComposeEditor } from "@/components/compose-editor";
import { ComposeLogs } from "@/components/compose-logs";
import { ComposeServices } from "@/components/compose-services";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  params: { composeName },
}: {
  params: { composeName: string };
}) {
  return (
    <main className="flex-auto space-y-4 overflow-y-auto p-4">
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
  );
}
