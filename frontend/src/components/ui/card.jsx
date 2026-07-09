import { cn } from "@/lib/utils";

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:border-[var(--primary)]/30 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn("p-5 border-b border-[var(--border)]", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn("p-5", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn("text-lg font-bold text-[var(--foreground)]", className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }) {
  return <p className={cn("text-sm text-[var(--muted-foreground)] mt-1", className)} {...props}>{children}</p>;
}
