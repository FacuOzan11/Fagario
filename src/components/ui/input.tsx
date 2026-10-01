import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3.5 text-[0.9375rem] text-foreground",
        "transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-subtle-foreground",
        "outline-none hover:border-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "[&[type=number]]:tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
