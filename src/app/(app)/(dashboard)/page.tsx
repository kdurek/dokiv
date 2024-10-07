import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <HydrateClient>
      <main className="p-4">Work in progress</main>
    </HydrateClient>
  );
}
