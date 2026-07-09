import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return <div className={cn("bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-sm", className)} {...props}>{children}</div>;
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn("p-4 border-b border-[var(--border)]", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn("p-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props}>{children}</h3>;
}
