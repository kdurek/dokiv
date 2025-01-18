import { stackSocket } from "@/lib/socket";
import type { Stack } from "@/server/utils";
import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

export const stackListAtom = atom<Stack[]>([]);

export const stackLoadingAtom = atom(false);
export const stackErrorAtom = atom<string | null>(null);

export const stackListEffectAtom = atomEffect((_, set) => {
  set(stackLoadingAtom, true);

  stackSocket.emit("stackList");
  stackSocket.on("stackList", (data) => {
    set(stackListAtom, data);
    set(stackLoadingAtom, false);
    set(stackErrorAtom, null);
  });

  stackSocket.on("error", (error) => {
    set(stackErrorAtom, error.message);
    set(stackLoadingAtom, false);
  });

  return () => {
    stackSocket.off("stackList");
    stackSocket.off("error");
  };
});
