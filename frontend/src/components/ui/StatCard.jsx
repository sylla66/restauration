import { cn } from "@/lib/utils";

const gradients = {
  orange: "from-orange-500 to-orange-600",
  green: "from-emerald-500 to-emerald-600",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
  teal: "from-teal-500 to-teal-600",
};

export default function StatCard({ label, value, icon: Icon, gradient = "orange", subtitle, className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          {subtitle && <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", gradients[gradient] || gradients.orange)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60", gradients[gradient] || gradients.orange)} />
    </div>
  );
}
