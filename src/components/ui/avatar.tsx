import type * as React from "react";

import { cn } from "@/lib/utils";

/** Iniciales (máx. 2) de un nombre: "Estudio Lagos Arquitectura" -> "EL". */
function iniciales(nombre: string) {
  const palabras = nombre
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((p) => p.length > 1 || /\p{Lu}/u.test(p));
  return (
    palabras
      .slice(0, 2)
      .map((p) => p[0])
      .join("") || nombre.slice(0, 1)
  ).toUpperCase();
}

type AvatarProps = Omit<React.ComponentProps<"span">, "children"> & {
  name: string;
};

/** Avatar de iniciales, decorativo (el nombre ya está en el texto vecino). */
function Avatar({ name, className, ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      aria-hidden
      className={cn(
        "bg-accent-soft text-accent inline-flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-[1.0625rem] leading-none select-none",
        className,
      )}
      {...props}
    >
      {iniciales(name)}
    </span>
  );
}

export { Avatar, iniciales };
