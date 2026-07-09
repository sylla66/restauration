import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X, CreditCard, Store, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useState } from "react";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { count } = useCart();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const title = user?.role === "GERANT" && user?.managedRestaurant?.name ? user.managedRestaurant.name : "Dakar Gourmet";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xs">
              <Store className="w-4 h-4" />
            </div>
            <span className="bg-gradient-to-r from-[var(--primary)] to-orange-500 bg-clip-text text-transparent">{title}</span>
            {user && <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} title={connected ? "Connecté" : "Déconnecté"} />}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/menu" className="px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Menu</Link>
            {user ? (
              <>
                {user.role === "LIVREUR" ? (
                  <Link to="/delivery" className="px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Livraisons</Link>
                ) : (
                  <>
                    <Link to="/orders" className="px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Mes commandes</Link>
                    <Link to="/payments" className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"><CreditCard className="w-4 h-4" /></Link>
                  </>
                )}
                {(user.role === "ADMIN" || user.role === "GERANT") && (
                  <Link to="/admin" className="px-3 py-2 rounded-xl text-sm font-medium bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">Admin</Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">{user.name?.charAt(0) || "U"}</div>
                  <span className="hidden lg:inline">{user.name}</span>
                </Link>
                <ThemeToggle />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/login"><Button size="sm" variant="outline">Connexion</Button></Link>
                <Link to="/register"><Button size="sm" variant="outline">Inscription</Button></Link>
              </>
            )}
            <Link to="/cart" className="relative p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">{count > 9 ? "9+" : count}</span>}
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5 text-[var(--foreground)]" />
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">{count > 9 ? "9+" : count}</span>}
            </Link>
            <ThemeToggle />
            <button className="p-2 rounded-xl hover:bg-[var(--muted)]" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)] p-4 flex flex-col gap-1 animate-slide-up">
            <Link to="/menu" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Menu</Link>
            {user ? (
              <>
                {user.role === "LIVREUR" ? (
                  <Link to="/delivery" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Livraisons</Link>
                ) : (
                  <Link to="/orders" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Mes commandes</Link>
                )}
                <Link to="/profile" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Profil</Link>
                {(user.role === "ADMIN" || user.role === "GERANT") && <Link to="/admin" className="px-3 py-2.5 rounded-xl text-sm font-medium bg-[var(--primary-light)] text-[var(--primary)]" onClick={() => setShowMenu(false)}>Admin</Link>}
                {user.role !== "LIVREUR" && <Link to="/payments" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Paiements</Link>}
                <button onClick={() => { logout(); navigate("/"); setShowMenu(false); }} className="px-3 py-2.5 rounded-xl text-sm font-medium text-left text-red-500 hover:bg-red-50">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Connexion</Link>
                <Link to="/register" className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--muted)]" onClick={() => setShowMenu(false)}>Inscription</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
