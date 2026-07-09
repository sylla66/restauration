import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orders, payments } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Trash2, Minus, Plus, ArrowLeft, Bike, Store, ShoppingCart, CreditCard, MapPin } from "lucide-react";

const paymentMethods = [
  { value: "cash", label: "Espèces", icon: "💵" },
  { value: "wave", label: "Wave", icon: "📱" },
  { value: "orange_money", label: "Orange Money", icon: "📱" },
  { value: "free_money", label: "Free Money", icon: "📱" },
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
    if (!restaurantId) { toast("Aucun restaurant sélectionné.", "error"); return; }
    setSubmitting(true);
    try {
      const body = { restaurantId, items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })), notes: notes || undefined };

      let res;
      if (channel === "delivery") {
        if (!deliveryAddress.trim()) { setSubmitting(false); toast("Adresse de livraison requise.", "error"); return; }
        res = await orders.createRemote({ ...body, subType: "DELIVERY", deliveryAddress: deliveryAddress.trim() });
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
      <div className="text-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-[var(--muted-foreground)]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-[var(--muted-foreground)] mb-6">Ajoutez des plats depuis le menu</p>
        <Link to="/menu"><Button size="lg">Voir le menu</Button></Link>
      </div>
    );
  }

  const deliveryFee = channel === "delivery" ? 1000 : 0;
  const grandTotal = total + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/menu" className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold">Votre panier</h1>
        <Badge variant="primary" size="sm">{count} article{count > 1 ? "s" : ""}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.menuItemId} hover>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {item.image && <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-sm font-semibold text-[var(--primary)]">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-9 h-9 rounded-xl bg-gradient-primary text-white flex items-center justify-center hover:shadow-md transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeItem(item.menuItemId)} className="w-9 h-9 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center ml-1 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Type de commande</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button onClick={() => setChannel("on-site")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${channel === "on-site" ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
                    <Store className="w-4 h-4" /> Sur place
                  </button>
                  <button onClick={() => setChannel("delivery")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${channel === "delivery" ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
                    <Bike className="w-4 h-4" /> Livraison
                  </button>
                </div>
              </div>

              {channel === "delivery" && (
                <div>
                  <Label>Adresse de livraison</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Rue, quartier, ville..." className="pl-9" />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Paiement</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {paymentMethods.map((m) => (
                    <button key={m.value} onClick={() => setPaymentMethod(m.value)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === m.value ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
                      <CreditCard className="w-4 h-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instructions..." />
              </div>
            </CardContent>
          </Card>

          <Card className="sticky top-24">
            <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)] rounded-t-2xl" />
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                <span>Sous-total</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                  <span>Livraison</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-xl font-extrabold text-[var(--primary)]">{grandTotal.toLocaleString()} FCFA</span>
              </div>
              <Button className="w-full mt-2" size="lg" onClick={handleOrder} disabled={submitting}>
                {submitting ? "Commande en cours..." : "Commander"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
