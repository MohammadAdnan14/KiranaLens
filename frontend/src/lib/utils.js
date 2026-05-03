import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN")
export const fmtR = (lo, hi) => `${fmt(lo)} – ${fmt(hi)}`
