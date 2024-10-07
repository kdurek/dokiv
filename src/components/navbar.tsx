import { DropdownMenuLogoutItem } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { validateRequest } from "@/server/auth/react";
import { ContainerIcon, User2 } from "lucide-react";
import Link from "next/link";

export async function Navbar() {
  const { user } = await validateRequest();

  return (
    <div className="z-50 flex h-16 items-center border-b px-4">
      <div className="flex items-center gap-2">
        <ContainerIcon />
        <Link href="/" className="font-bold">
          Dokiv
        </Link>
      </div>
      <div className="ml-auto flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden">
              <User2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLogoutItem />
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </div>
    </div>
  );
}
