import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orders, payments } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Trash2, Minus, Plus, ArrowLeft, Bike, Store } from "lucide-react";

const paymentMethods = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "free_money", label: "Free Money" },
  { value: "cash", label: "Espèces" },
];

export default function Cart() {
  const { items, total, count, restaurantId, updateQuantity, removeItem, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [channel, setChannel] = useState("on-site");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  async function handleOrder() {
    if (!user) return navigate("/login");
    if (!restaurantId) { setSubmitting(false); toast("Aucun restaurant sélectionné. Choisissez d'abord un menu.", "error"); return; }
    setSubmitting(true);
    try {
      const body = {
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        notes: notes || undefined,
      };

      let res;
      if (channel === "delivery") {
        if (!deliveryAddress.trim()) { setSubmitting(false); toast("Adresse de livraison requise.", "error"); return; }
        res = await orders.createRemote({ ...body, deliveryAddress: deliveryAddress.trim() });
      } else {
        res = await orders.createOnSite(body);
      }

      if (paymentMethod !== "cash") {
        await payments.init({ orderId: res.order.id, method: paymentMethod, amount: res.order.total });
      }

      toast("Commande passée avec succès !");
      clear();
      navigate(`/orders/${res.order.id}`);
    } catch (err) {
      toast(err.message, "error");
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

      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Type de commande</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button onClick={() => setChannel("on-site")} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${channel === "on-site" ? "border-[#e67e22] bg-orange-50 text-[#e67e22]" : "border-gray-200 hover:border-gray-300"}`}>
                <Store className="w-4 h-4" /> Sur place
              </button>
              <button onClick={() => setChannel("delivery")} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${channel === "delivery" ? "border-[#e67e22] bg-orange-50 text-[#e67e22]" : "border-gray-200 hover:border-gray-300"}`}>
                <Bike className="w-4 h-4" /> Livraison
              </button>
            </div>
          </div>

          {channel === "delivery" && (
            <div>
              <Label>Adresse de livraison</Label>
              <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Rue, quartier, ville..." />
            </div>
          )}

          <div>
            <Label>Mode de paiement</Label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22]">
              {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <Label>Notes (optionnel)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instructions supplémentaires..." />
          </div>
        </CardContent>
      </Card>

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
