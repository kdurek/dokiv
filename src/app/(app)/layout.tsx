import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { validateRequest } from "@/server/auth/react";
import { api, HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session } = await validateRequest();
  if (!session) {
    return redirect("/login");
  }

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
