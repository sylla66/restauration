import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] flex items-center justify-center transition-all duration-200"
      title={dark ? "Mode clair" : "Mode sombre"}
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${dark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`} style={{ color: "#e67e22" }} />
        <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} style={{ color: "#a78bfa" }} />
      </div>
    </button>
  );
}
