import type { LabelHTMLAttributes, ReactNode } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
  htmlFor: string;
};

export function Label({ children, className = "", ...rest }: LabelProps) {
  return (
    <label className={`etiquette ${className}`.trim()} {...rest}>
      {children}
    </label>
  );
}