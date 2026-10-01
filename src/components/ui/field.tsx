import * as React from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  id?: string;
  /** Clases para el contenedor. `className` va al input. */
  containerClassName?: string;
  /** Reemplaza el Input por otro control; recibe id y atributos aria. */
  children?: React.ReactElement<React.ComponentProps<"input">>;
};

function Field({
  label,
  hint,
  error,
  id,
  containerClassName,
  className,
  children,
  ...inputProps
}: FieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    id: fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  } as const;

  return (
    <div data-slot="field" data-invalid={error ? "" : undefined} className={cn("grid gap-2", containerClassName)}>
      <Label htmlFor={fieldId}>{label}</Label>
      {children ? (
        React.cloneElement(children, controlProps)
      ) : (
        <Input className={className} {...inputProps} {...controlProps} />
      )}
      {hint && !error ? (
        <p id={hintId} data-slot="field-hint" className="text-sm leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          data-slot="field-error"
          className="flex items-start gap-1.5 text-sm leading-5 text-danger"
        >
          <WarningCircle weight="light" aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
      {/* el hint queda referenciado aunque haya error */}
      {hint && error ? (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export { Field };
export type { FieldProps };
