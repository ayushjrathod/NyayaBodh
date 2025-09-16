import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Merge arbitrary className inputs into a single, deduplicated Tailwind CSS string.
 *
 * Accepts the same input types as `clsx` (strings, arrays, objects, nested combinations),
 * builds a space-separated class string, then resolves and deduplicates Tailwind-specific
 * utilities using `twMerge`.
 *
 * @param {...any} inputs - Class name values (strings, arrays, objects, or nested combinations).
 * @returns {string} The merged, conflict-resolved className string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
