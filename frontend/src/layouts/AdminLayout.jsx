import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Store, ListOrdered, LayoutDashboard, ChevronLeft, ChevronRight, Users, Star, AlertTriangle, UserCog, Menu as MenuIcon, Package, UtensilsCrossed, LogOut, ExternalLink, Bike, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const allLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/restaurants", icon: Store, label: "Restaurants" },
  { to: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
  { to: "/admin/inventory", icon: Package, label: "Inventaire" },
  { to: "/admin/orders", icon: ListOrdered, label: "Commandes" },
  { to: "/admin/reviews", icon: Star, label: "Avis" },
  { to: "/admin/complaints", icon: AlertTriangle, label: "Réclamations" },
  { to: "/admin/deliveries", icon: Bike, label: "Livraisons" },
  { to: "/admin/users", icon: Users, label: "Utilisateurs" },
  { to: "/admin/staff", icon: UserCog, label: "Personnel" },
];

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "ADMIN" && user.role !== "GERANT"))) navigate("/");
  }, [user, loading]);

  if (loading) return null;

  const links = allLinks.filter((l) => {
    if (user?.role === "GERANT" && (l.to === "/admin/users" || l.to === "/admin/staff" || l.to === "/admin/restaurants")) return false;
    return true;
  });

  const sidebarContent = (
    <>
      <div className={`p-4 border-b border-[var(--border)] flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">{user?.role === "GERANT" ? "Gérant" : "Admin"}</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden md:block shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {links.map((l) => {
          const active = location.pathname === l.to || (l.to !== "/admin" && location.pathname.startsWith(l.to));
          return (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-gradient-primary text-white shadow-md" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
              <l.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{l.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`p-2 border-t border-[var(--border)] space-y-0.5 ${collapsed ? "text-center" : ""}`}>
        <Link to="/menu" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && "Voir le menu"}
        </Link>
        <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Déconnexion"}
        </button>
        {!collapsed && (
          <div className="px-3 pt-2 mt-1">
            <ThemeToggle />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex gap-0 min-h-[calc(100vh-4rem)]">
      <button className="md:hidden fixed bottom-4 right-4 z-50 bg-gradient-primary text-white p-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all" onClick={() => setMobileOpen(true)}>
        <MenuIcon className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[var(--card)] border-r border-[var(--border)] overflow-y-auto flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex md:flex-col bg-[var(--card)] border-r border-[var(--border)] transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}>
        {sidebarContent}
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
