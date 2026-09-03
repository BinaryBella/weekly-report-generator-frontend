import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared styling for a plain `<select>`, matching the `Input`/`SelectTrigger`
 * chrome. Used by the dashboard filter bars, which use native selects instead
 * of the Radix `Select` for simplicity in a row of many controls. */
export const NATIVE_SELECT_CLASS =
  "h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
