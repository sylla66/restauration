import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[var(--muted)] text-[var(--foreground)]",
  primary: "bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/20",
  secondary: "bg-[var(--secondary-light)] text-[var(--secondary)] border border-[var(--secondary)]/20",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({ className, variant = "default", size = "md", dot, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold leading-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}
