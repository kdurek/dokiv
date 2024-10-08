"use client";

import { stackListEffectAtom } from "@/lib/atoms";
import { useAtom } from "jotai";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useAtom(stackListEffectAtom);

  return <>{children}</>;
}
