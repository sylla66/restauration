import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orders } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Truck, ChefHat, Package, ListOrdered } from "lucide-react";

const statusMeta = {
  PENDING: { label: "En attente", variant: "warning", icon: Clock },
  CONFIRMED: { label: "Confirmée", variant: "info", icon: CheckCircle },
  PREPARING: { label: "En préparation", variant: "warning", icon: ChefHat },
  READY: { label: "Prête", variant: "info", icon: Package },
  DELIVERED: { label: "Livrée", variant: "secondary", icon: CheckCircle },
  CANCELLED: { label: "Annulée", variant: "danger", icon: XCircle },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    orders.list({}).then((res) => setList(res.orders || [])).finally(() => setLoading(false));
  }, [user]);

  async function handleCancel(id) {
    if (!confirm("Annuler cette commande ?")) return;
    try {
      await orders.cancel(id);
      setList((prev) => prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o)));
    } catch (err) { alert(err.message); }
  }

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl animate-shimmer" />)}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ListOrdered className="w-6 h-6 text-[var(--primary)]" /> Mes commandes</h1>
        <Badge variant="primary" size="sm">{list.length} commande{list.length > 1 ? "s" : ""}</Badge>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <h2 className="text-xl font-bold mb-2">Aucune commande</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Passez votre première commande dès maintenant</p>
          <Button onClick={() => navigate("/menu")}>Voir le menu</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((order) => {
            const m = statusMeta[order.status] || statusMeta.PENDING;
            const Icon = m.icon;
            return (
              <Card key={order.id} hover className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${order.status === "DELIVERED" ? "bg-green-500" : order.status === "CANCELLED" ? "bg-red-500" : "bg-gradient-primary"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">#{order.orderNumber || order.id.slice(0, 8)}</p>
                        <Badge variant={m.variant} size="sm" dot>{m.label}</Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                        {order.restaurant?.name && ` • ${order.restaurant.name}`}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{order.channel === "REMOTE" ? (order.subType === "DELIVERY" ? "Livraison" : "À emporter") : "Sur place"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[var(--primary)]">{order.total.toLocaleString()} FCFA</p>
                      {order.status === "PENDING" && (
                        <Button variant="ghost" size="sm" className="text-red-500 mt-1" onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
