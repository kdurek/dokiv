import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "@/components/sidebar";
import { ContainerIcon } from "lucide-react";
import Link from "next/link";

export default async function ComposeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100dvh-64px)]">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <div className="z-50 flex h-16 items-center border-b px-4">
      <div className="flex items-center gap-2">
        <ContainerIcon />
        <Link href="/" className="font-bold">
          Dokiv
        </Link>
      </div>
      <div className="ml-auto flex gap-2">
        <ModeToggle />
      </div>
    </div>
  );
}
