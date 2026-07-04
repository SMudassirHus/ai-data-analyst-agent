import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "blue" | "success" | "amber" | "slate";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  blue: "border-indigo-200 bg-white text-[#635BFF]",
  success: "border-emerald-200 bg-white text-[#16A34A]",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-100 text-slate-600",
};

function Badge({
  children,
  variant = "slate",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
