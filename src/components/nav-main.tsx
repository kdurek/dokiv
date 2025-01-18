"use client";

import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const NavMain = memo(function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    items?: {
      title: string;
      url: string;
      status: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => (
        <SidebarGroup key={item.title} className={cn(!item.title && "mt-2")}>
          {item.title && <SidebarGroupLabel>{item.title}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {item.items?.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url === pathname}>
                    <Link
                      href={item.url}
                      className="flex justify-between gap-2"
                    >
                      {item.title}
                      <StackStatus status={item.status} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
});

const StackStatus = memo(function StackStatus({ status }: { status: string }) {
  return (
    <div
      className={cn("size-4 rounded-full bg-gray-500", {
        "bg-green-500": status === "running",
        "bg-red-500": status === "exited",
      })}
    />
  );
});
