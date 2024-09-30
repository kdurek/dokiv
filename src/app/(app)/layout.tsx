import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { api, HydrateClient } from "@/trpc/server";

export default function ComposeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  void api.compose.getStackList.prefetch();

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100dvh-64px)]">
        <HydrateClient>
          <Sidebar />
        </HydrateClient>
        {children}
      </div>
    </div>
  );
}
