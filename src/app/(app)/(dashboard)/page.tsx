import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <HydrateClient>
      <main>Work in progress</main>
    </HydrateClient>
  );
}
