"use client";

import { logout } from "@/app/(auth)/actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function DropdownMenuLogoutItem() {
  return <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>;
}
