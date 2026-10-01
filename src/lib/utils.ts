import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge no conoce las utilidades tipográficas propias de globals.css;
 * sin esto, `text-figure-lg` + `text-danger` se pisaban (las tomaba como colores).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "figure-xl",
            "figure-lg",
            "title",
            "heading",
            "eyebrow",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
