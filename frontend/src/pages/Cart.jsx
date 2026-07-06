import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orders } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, total, count, updateQuantity, removeItem, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleOrder() {
    if (!user) return navigate("/login");
    setSubmitting(true);
    try {
      const res = await orders.createOnSite({
        restaurantId: "use_restaurant_id_from_menu",
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });
      clear();
      navigate(`/orders/${res.order.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Votre panier est vide</h2>
        <Link to="/menu"><Button>Voir le menu</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/menu"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <h1 className="text-xl font-bold">Votre panier</h1>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <Card key={item.menuItemId}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">{(item.price * item.quantity).toLocaleString()} FCFA</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-[#e67e22] text-white flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => removeItem(item.menuItemId)} className="text-red-400 hover:text-red-600 ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>Total</span>
          <span className="text-[#e67e22]">{total.toLocaleString()} FCFA</span>
        </div>
        <Button className="w-full" size="lg" onClick={handleOrder} disabled={submitting}>
          {submitting ? "Commande en cours..." : "Commander"}
        </Button>
      </div>
    </div>
  );
}
