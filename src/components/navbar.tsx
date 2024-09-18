import { ModeToggle } from "@/components/mode-toggle";
import { ContainerIcon } from "lucide-react";
import Link from "next/link";

export function Navbar() {
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
