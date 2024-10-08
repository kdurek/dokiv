import { stackListSocket } from "@/lib/socket";
import type { Stack } from "@/server/api/utils";
import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

export const stackListAtom = atom<Stack[]>([]);

export const stackListEffectAtom = atomEffect((_, set) => {
  stackListSocket.on("stackList", (data) => {
    set(stackListAtom, data);
  });

  return () => {
    stackListSocket.off("stackList");
  };
});

export const isEditingAtom = atom(false);

export const composeValueAtom = atom("");
