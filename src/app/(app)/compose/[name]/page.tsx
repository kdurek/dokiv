import { ComposeActions } from "@/components/compose-actions";
import { ComposeEditor } from "@/components/compose-editor";
import { ComposeLogs } from "@/components/compose-logs";
import { ComposeServices } from "@/components/compose-services";
import { api, HydrateClient } from "@/trpc/server";

export default async function ComposePage({
  params: { name },
}: {
  params: { name: string };
}) {
  void api.compose.getStackFile.prefetch({
    name,
  });
  void api.compose.getParsedStackFile.prefetch({
    name,
  });
  void api.compose.containersByName.prefetch({
    name,
  });
  // const containersByName = await api.compose.containersByName({
  //   name,
  // });
  // void api.compose.subscribeLogs.prefetch({
  //   name,
  //   services: containersByName.map((container) => container.name),
  // });

  return (
    <HydrateClient>
      <main className="flex w-full flex-col gap-4 overflow-y-auto p-4">
        <h2 className="text-4xl">{name}</h2>
        <ComposeActions name={name} />
        <div className="flex gap-4">
          <ComposeServices name={name} />
          <ComposeEditor name={name} />
        </div>
        <ComposeLogs name={name} />
      </main>
    </HydrateClient>
  );
}
