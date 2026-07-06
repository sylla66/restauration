import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return <input className={cn("w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent", className)} {...props} />;
}

export function Label({ className, children, ...props }) {
  return <label className={cn("block text-sm font-medium text-gray-700 mb-1", className)} {...props}>{children}</label>;
}
