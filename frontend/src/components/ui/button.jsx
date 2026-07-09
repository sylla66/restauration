import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[#e67e22] text-white hover:bg-[#d35400]",
  secondary: "bg-[#2ecc71] text-white hover:bg-[#27ae60]",
  outline: "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]",
  ghost: "hover:bg-[var(--muted)]",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ className, variant = "default", size = "md", disabled, children, ...props }) {
  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
