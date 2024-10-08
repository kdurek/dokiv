import { Providers } from "@/app/(app)/providers";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { validateRequest } from "@/server/auth/react";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session } = await validateRequest();
  if (!session) {
    return redirect("/login");
  }

  return (
    <Providers>
      <div className="relative min-h-screen">
        <Navbar />
        <div className="flex h-[calc(100dvh-64px)]">
          <Sidebar />
          {children}
        </div>
      </div>
    </Providers>
  );
}
