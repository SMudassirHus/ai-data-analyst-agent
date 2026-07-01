import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#635BFF] text-white shadow-sm hover:bg-[#5148E5]",
  secondary:
    "border border-[#E5E7EB] bg-white text-[#111827] shadow-sm hover:border-[#635BFF] hover:text-[#635BFF]",
  ghost: "text-[#6B7280] hover:bg-slate-100 hover:text-[#111827]",
};

function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
