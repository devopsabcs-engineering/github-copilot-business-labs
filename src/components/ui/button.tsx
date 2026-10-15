import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", type = "button", ...rest } = props;
  return <button className={`bouton ${className}`.trim()} type={type} {...rest} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function ButtonLink({ className = "", href, ...rest }: ButtonLinkProps) {
  return (
    <Link className={`bouton ${className}`.trim()} href={href} {...rest} />
  );
}