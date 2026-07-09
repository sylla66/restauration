import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { restaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Plus, Minus, Search, Store, MapPin } from "lucide-react";

export default function Menu() {
  const [searchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { items, addItem, updateQuantity, setRestaurantId } = useCart();
  const toast = useToast();

  async function loadRestaurant(id) {
    setLoading(true);
    try {
      const res = await restaurants.getById(id);
      setRestaurantId(id);
      setRestaurant(res.restaurant);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    restaurants.list().then((res) => {
      const list = res.restaurants || [];
      setAllRestaurants(list);
      const initialId = searchParams.get("restaurant") || list[0]?.id;
      if (initialId) loadRestaurant(initialId);
    }).finally(() => setLoading(false));
  }, []);

  function getQty(id) {
    const item = items.find((i) => i.menuItemId === id);
    return item ? item.quantity : 0;
  }

  if (loading && !restaurant) return (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-2xl animate-shimmer" />
      ))}
    </div>
  );

  if (allRestaurants.length === 0) return (
    <div className="text-center py-20 animate-fade-in">
      <Store className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
      <h2 className="text-xl font-bold mb-2">Aucun restaurant disponible</h2>
      <p className="text-[var(--muted-foreground)]">Réessayez plus tard</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          {allRestaurants.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allRestaurants.map((r) => (
                <button key={r.id} onClick={() => loadRestaurant(r.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${restaurant?.id === r.id ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]"}`}>
                  <Store className="w-4 h-4" /> {r.name}
                </button>
              ))}
            </div>
          )}
          {allRestaurants.length === 1 && restaurant && (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {restaurant.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                {restaurant.address && <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1"><MapPin className="w-3 h-3" /> {restaurant.address}</p>}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un plat..." className="pl-9 w-full sm:w-56" />
        </div>
      </div>

      {restaurant && restaurant.categories.map((cat) => {
        const filtered = search
          ? cat.menuItems?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase()))
          : cat.menuItems;
        if (!filtered?.length) return null;
        return (
          <div key={cat.id} className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 flex-1 bg-gradient-to-r from-[var(--primary)]/30 to-transparent rounded-full" />
              <h2 className="text-lg font-bold text-[var(--primary)]">{cat.name}</h2>
              <div className="h-1 flex-1 bg-gradient-to-l from-[var(--primary)]/30 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const qty = getQty(item.id);
                return (
                  <Card key={item.id} hover className="overflow-hidden group">
                    {item.image && (
                      <div className="relative overflow-hidden h-40">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {!item.isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Badge variant="warning">Indisponible</Badge></div>}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-[var(--foreground)] ${!item.isAvailable ? "line-through text-[var(--muted-foreground)]" : ""}`}>{item.name}</h3>
                            {item.stock !== null && item.stock <= 3 && item.stock >= 0 && <Badge variant="warning" size="sm">Stock: {item.stock}</Badge>}
                          </div>
                          {item.description && <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{item.description}</p>}
                          <p className="text-lg font-bold text-[var(--primary)] mt-2">{item.price.toLocaleString()} FCFA</p>
                        </div>
                        <div className="shrink-0">
                          {qty > 0 ? (
                            <div className="flex items-center gap-1.5 bg-[var(--primary-light)] rounded-xl p-1">
                              <button onClick={() => updateQuantity(item.id, qty - 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors shadow-sm">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold w-6 text-center text-sm">{qty}</span>
                              <button onClick={() => { addItem(item); toast(`${item.name} ajouté`); }} className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button disabled={!item.isAvailable} onClick={() => { addItem(item); toast(`${item.name} ajouté`); }} className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
