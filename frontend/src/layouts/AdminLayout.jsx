import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Store, ListOrdered, LayoutDashboard, ChevronLeft, ChevronRight, Users, Star, AlertTriangle, UserCog } from "lucide-react";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/restaurants", icon: Store, label: "Restaurants" },
  { to: "/admin/orders", icon: ListOrdered, label: "Commandes" },
  { to: "/admin/reviews", icon: Star, label: "Avis" },
  { to: "/admin/complaints", icon: AlertTriangle, label: "Réclamations" },
  { to: "/admin/users", icon: Users, label: "Utilisateurs" },
  { to: "/admin/staff", icon: UserCog, label: "Personnel" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex gap-0">
      <aside className={`bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-all ${collapsed ? "w-16" : "w-56"}`}>
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          {!collapsed && <span className="font-semibold text-sm">Administration</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {links.map((l) => {
            const active = location.pathname === l.to || (l.to !== "/admin" && location.pathname.startsWith(l.to));
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-orange-50 text-[#e67e22]" : "text-gray-600 hover:bg-gray-50"}`}>
                <l.icon className="w-4 h-4 shrink-0" />
                {!collapsed && l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
