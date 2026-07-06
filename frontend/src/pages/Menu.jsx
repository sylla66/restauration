import { useState, useEffect } from "react";
import { restaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Plus, Minus } from "lucide-react";

export default function Menu() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, setRestaurantId } = useCart();
  const toast = useToast();

  useEffect(() => {
    restaurants.list().then((res) => {
      if (res.restaurants.length > 0) {
        setRestaurantId(res.restaurants[0].id);
        return restaurants.getById(res.restaurants[0].id);
      }
    }).then((res) => {
      if (res) setRestaurant(res.restaurant);
    }).finally(() => setLoading(false));
  }, []);

  function getQty(id) {
    const item = items.find((i) => i.menuItemId === id);
    return item ? item.quantity : 0;
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  if (!restaurant) return <div className="text-center py-12 text-gray-500">Aucun restaurant disponible</div>;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        {restaurant.logo && <img src={restaurant.logo} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover" />}
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-500">{restaurant.address}</p>
        </div>
      </div>

      {restaurant.categories?.map((cat) => (
        <div key={cat.id} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#e67e22]">{cat.name}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.menuItems?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                      <p className="text-[#e67e22] font-bold mt-2">{item.price.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getQty(item.id) > 0 ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, getQty(item.id) - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
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
      ))}
    </div>
  );
}
