import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Store, ListOrdered, LayoutDashboard, ChevronLeft, ChevronRight, Users, Star, AlertTriangle, UserCog, Menu as MenuIcon, Package, UtensilsCrossed, LogOut, ExternalLink, Bike } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
    if (!loading && (!user || (user.role !== "ADMIN" && user.role !== "GERANT"))) {
      navigate("/");
    }
  }, [user, loading]);

  if (loading) return null;

  const links = allLinks.filter((l) => {
    if (user?.role === "GERANT" && (l.to === "/admin/users" || l.to === "/admin/staff" || l.to === "/admin/restaurants")) return false;
    return true;
  });

  const sidebarContent = (
    <>
      <div className="p-3 border-b border-[var(--border)] flex justify-between items-center">
        {!collapsed && <span className="font-semibold text-sm">Administration</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden md:block">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="p-2 space-y-1 flex-1">
        {links.map((l) => {
          const active = location.pathname === l.to || (l.to !== "/admin" && location.pathname.startsWith(l.to));
          return (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-orange-50 dark:bg-orange-900/20 text-[#e67e22]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
              <l.icon className="w-4 h-4 shrink-0" />
              {!collapsed && l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-[var(--border)] space-y-1">
        <Link to="/menu" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && "Voir le menu"}
        </Link>
        <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex gap-0 min-h-[calc(100vh-4rem)]">
      <button className="md:hidden fixed bottom-4 right-4 z-50 bg-[#e67e22] text-white p-3 rounded-full shadow-lg" onClick={() => setMobileOpen(true)}>
        <MenuIcon className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[var(--background)] border-r border-[var(--border)] overflow-y-auto flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex md:flex-col bg-[var(--background)] border-r border-[var(--border)] transition-all ${collapsed ? "w-16" : "w-56"}`}>
        {sidebarContent}
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
