import { DropdownMenuLogoutItem } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { validateRequest } from "@/server/auth/react";
import { ContainerIcon, User2 } from "lucide-react";
import Link from "next/link";

export async function Navbar() {
  const { user } = await validateRequest();

  return (
    <div className="z-50 flex h-16 items-center border-b px-4">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <ContainerIcon />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="px-0">
            <SheetHeader>
              <SheetTitle>Stack List</SheetTitle>
            </SheetHeader>
            <Sidebar withSheetClose />
          </SheetContent>
        </Sheet>
        <ContainerIcon className="hidden sm:block" />
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
