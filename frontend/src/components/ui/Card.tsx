import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "section" | "article" | "div";
};

function Card({
  children,
  as: Component = "section",
  className = "",
  ...props
}: CardProps) {
  return (
    <Component
      className={`rounded-xl border border-[#E5E7EB] bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
