import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wsUrlBase =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`;
