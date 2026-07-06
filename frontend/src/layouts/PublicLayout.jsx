import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, User, LogOut, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[#e67e22]">Dakar Gourmet</Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/menu" className="text-sm text-gray-600 hover:text-[#e67e22]">Menu</Link>
            {user ? (
              <>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-[#e67e22]">Mes commandes</Link>
                {user.role === "ADMIN" && <Link to="/admin" className="text-sm text-gray-600 hover:text-[#e67e22]">Admin</Link>}
                <span className="text-sm text-gray-500">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/login"><Button size="sm">Connexion</Button></Link>
            )}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {count > 0 && <span className="absolute -top-2 -right-2 bg-[#e67e22] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
            </Link>
          </nav>

          <button className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-gray-100 p-4 flex flex-col gap-3">
            <Link to="/menu" className="text-sm" onClick={() => setShowMenu(false)}>Menu</Link>
            {user ? (
              <>
                <Link to="/orders" className="text-sm" onClick={() => setShowMenu(false)}>Mes commandes</Link>
                {user.role === "ADMIN" && <Link to="/admin" onClick={() => setShowMenu(false)}>Admin</Link>}
                <button onClick={() => { logout(); navigate("/"); setShowMenu(false); }} className="text-sm text-left text-red-500">Déconnexion</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setShowMenu(false)}>Connexion</Link>
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
