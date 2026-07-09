import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]",
        "placeholder:text-[var(--muted-foreground)]/60",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }) {
  return (
    <label className={cn("block text-sm font-semibold text-[var(--foreground)] mb-1.5", className)} {...props}>
      {children}
    </label>
  );
}
