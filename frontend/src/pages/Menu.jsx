import { useState, useEffect } from "react";
import { restaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/Pagination";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Plus, Minus, Store } from "lucide-react";

export default function Menu() {
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
      if (list.length > 0) {
        return loadRestaurant(list[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  function getQty(id) {
    const item = items.find((i) => i.menuItemId === id);
    return item ? item.quantity : 0;
  }

  if (loading && !restaurant) return <div className="text-center py-12 text-[var(--muted-foreground)]">Chargement...</div>;
  if (allRestaurants.length === 0) return <div className="text-center py-12 text-[var(--muted-foreground)]">Aucun restaurant disponible</div>;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          {allRestaurants.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allRestaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadRestaurant(r.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${restaurant?.id === r.id ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[#e67e22]/10"}`}
                >
                  <Store className="w-4 h-4" />
                  {r.name}
                </button>
              ))}
            </div>
          )}
          {allRestaurants.length === 1 && restaurant && (
            <div className="flex items-center gap-3">
              {restaurant.logo && <img src={restaurant.logo} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover" />}
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <p className="text-[var(--muted-foreground)]">{restaurant.address}</p>
              </div>
            </div>
          )}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un plat..." className="min-w-[200px]" />
      </div>

      {restaurant && restaurant.categories.map((cat) => {
        const filtered = search
          ? cat.menuItems?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase()))
          : cat.menuItems;
        if (!filtered?.length) return null;
        return (
          <div key={cat.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[#e67e22]">{cat.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{item.description}</p>}
                        <p className="text-[#e67e22] font-bold mt-2">{item.price.toLocaleString()} FCFA</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getQty(item.id) > 0 ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, getQty(item.id) - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[var(--muted)]">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium w-6 text-center">{getQty(item.id)}</span>
                            <button onClick={() => { addItem(item); toast(`${item.name} ajouté`); }} className="w-8 h-8 rounded-full bg-[#e67e22] text-white flex items-center justify-center hover:bg-[#d35400]">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { addItem(item); toast(`${item.name} ajouté`); }} className="w-10 h-10 rounded-full bg-[#e67e22] text-white flex items-center justify-center hover:bg-[#d35400]">
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
