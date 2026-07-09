import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useState } from "react";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { count } = useCart();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[#e67e22] flex items-center gap-2">
            {user?.role === "GERANT" && user?.managedRestaurant?.name ? user.managedRestaurant.name : "Dakar Gourmet"}
            {user && <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#2ecc71]" : "bg-red-400"}`} title={connected ? "Connecté" : "Déconnecté"} />}
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/menu" className="text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">Menu</Link>
            {user ? (
              <>
                {user.role === "LIVREUR" ? (
                  <Link to="/delivery" className="text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">Livraisons</Link>
                ) : (
                  <>
                    <Link to="/orders" className="text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">Mes commandes</Link>
                    <Link to="/payments" className="text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </Link>
                  </>
                )}
                {(user.role === "ADMIN" || user.role === "GERANT") && <Link to="/admin" className="text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">Admin</Link>}
                <Link to="/profile" className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[#e67e22] transition-colors">
                  <User className="w-4 h-4" /> <span className="hidden lg:inline">{user.name}</span>
                </Link>
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/login"><Button size="sm">Connexion</Button></Link>
              </>
            )}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-[var(--muted-foreground)]" />
              {count > 0 && <span className="absolute -top-2 -right-2 bg-[#e67e22] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-[var(--muted-foreground)]" />
              {count > 0 && <span className="absolute -top-2 -right-2 bg-[#e67e22] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
            </Link>
            <ThemeToggle />
            <button className="p-1" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] p-4 flex flex-col gap-3">
            <Link to="/menu" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Menu</Link>
            {user ? (
              <>
                {user.role === "LIVREUR" ? (
                  <Link to="/delivery" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Livraisons</Link>
                ) : (
                  <Link to="/orders" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Mes commandes</Link>
                )}
                <Link to="/profile" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Profil</Link>
                {(user.role === "ADMIN" || user.role === "GERANT") && <Link to="/admin" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Admin</Link>}
                {user.role !== "LIVREUR" && <Link to="/payments" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Paiements</Link>}
                <button onClick={() => { logout(); navigate("/"); setShowMenu(false); }} className="text-sm text-left text-red-500">Déconnexion</button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-[var(--muted-foreground)]" onClick={() => setShowMenu(false)}>Connexion</Link>
            )}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
