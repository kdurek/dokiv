import type { Stack } from "@/server/api/utils";

export let cachedStackList: Stack[] = [];

export const updateCachedStackList = (stackList: Stack[]) => {
  cachedStackList = stackList;
};
