import type { HTMLAttributes, ReactNode } from "react";

export function Alert(props: HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`alerte ${className}`.trim()} role="note" {...rest} />;
}

type AlertTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export function AlertTitle({ children, ...props }: AlertTitleProps) {
  return <h2 {...props}>{children}</h2>;
}

export function AlertDescription(props: HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`alerte-description ${className}`.trim()} {...rest} />;
}