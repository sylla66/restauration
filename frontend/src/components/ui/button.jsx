import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gradient-primary text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  secondary: "bg-gradient-secondary text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  outline: "border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary-light)] hover:scale-[1.02] active:scale-[0.98]",
  ghost: "hover:bg-[var(--muted)] hover:scale-[1.02] active:scale-[0.98]",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export function Button({ className, variant = "default", size = "md", disabled, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
