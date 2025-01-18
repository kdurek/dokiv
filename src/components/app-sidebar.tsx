"use client";

import * as React from "react";
import { useMemo } from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAtomValue } from "jotai";
import { stackListAtom } from "@/lib/atoms";
import { NavUser } from "@/components/nav-user";
import type { User } from "better-auth";
import { ComposeCreate } from "@/components/compose-create";

export function AppSidebar({
  user,
  ...props
}: {
  user: User;
} & React.ComponentProps<typeof Sidebar>) {
  const stackList = useAtomValue(stackListAtom);
  const navItems = useMemo(
    () => [
      {
        title: "Stacks",
        url: "",
        items: stackList.map((stack) => ({
          title: stack.name,
          url: `/compose/${stack.name}`,
          status: stack.status,
        })),
      },
    ],
    [stackList],
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="mx-2 mt-2">
        <ComposeCreate />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
