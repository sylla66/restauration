import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { orders, users, deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Clock, Search, Truck, ArrowRight, CheckCircle, XCircle, ChefHat, Package, MapPin } from "lucide-react";

const statusList = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const statusMeta = {
  PENDING: { label: "En attente", icon: Clock, variant: "warning" },
  CONFIRMED: { label: "Confirmée", icon: CheckCircle, variant: "info" },
  PREPARING: { label: "En préparation", icon: ChefHat, variant: "warning" },
  READY: { label: "Prête", icon: Package, variant: "info" },
  READY_FOR_PICKUP: { label: "Prête (retrait)", icon: Package, variant: "info" },
  OUT_FOR_DELIVERY: { label: "En livraison", icon: Truck, variant: "info" },
  DELIVERED: { label: "Livrée", icon: CheckCircle, variant: "secondary" },
  CANCELLED: { label: "Annulée", icon: XCircle, variant: "danger" },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [assignOrder, setAssignOrder] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    orders.list({}).then((res) => setList(res.orders || [])).finally(() => setLoading(false));
    users.list({ role: "LIVREUR" }).then((res) => setDeliveryPersons(res.users || [])).catch(() => {});
  }, []);

  const filtered = filter ? list.filter((o) => o.status === filter) : list;

  async function handleStatus(orderId, status) {
    try {
      await orders.updateStatus(orderId, status);
      setList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast(`Commande → ${statusMeta[status]?.label || status}`);
    } catch (err) { toast(err.message, "error"); }
  }

  function canAssign(order) {
    return order.channel === "REMOTE" && order.subType === "DELIVERY" && !order.delivery;
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedDeliveryPerson) { toast("Sélectionnez un livreur", "error"); return; }
    setAssigning(true);
    try {
      const body = { orderId: assignOrder.id, deliveryPersonId: selectedDeliveryPerson };
      if (estimatedTime) body.estimatedTime = parseInt(estimatedTime, 10);
      await deliveries.assign(body);
      toast("Livreur assigné !");
      setAssignOrder(null);
      setSelectedDeliveryPerson("");
      setEstimatedTime("");
      const res = await orders.list({});
      setList(res.orders || []);
    } catch (err) { toast(err.message, "error"); } finally { setAssigning(false); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <Badge variant="primary" size="sm">{list.length} commande{list.length > 1 ? "s" : ""}</Badge>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        <button onClick={() => setFilter("")} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${!filter ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>Toutes</button>
        {statusList.map((s) => {
          const m = statusMeta[s];
          return (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === s ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
              {m?.label || s}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="font-semibold">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const m = statusMeta[order.status] || statusMeta.PENDING;
            const Icon = m.icon;
            return (
              <Card key={order.id} hover>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${order.status === "DELIVERED" ? "bg-green-500" : order.status === "CANCELLED" ? "bg-red-500" : "bg-gradient-primary"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm">#{order.orderNumber || order.id.slice(0, 8)}</p>
                          <Badge variant={m.variant} size="sm" dot>{m.label}</Badge>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {new Date(order.createdAt).toLocaleString("fr-FR")}
                          {order.user?.name && ` • ${order.user.name}`}
                          {order.restaurant?.name && ` • ${order.restaurant.name}`}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {order.channel === "REMOTE" ? (order.subType === "DELIVERY" ? "Livraison" : "À emporter") : "Sur place"}
                          {order.delivery?.deliveryPerson && ` • Livreur: ${order.delivery.deliveryPerson.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:shrink-0">
                      <span className="font-extrabold text-[var(--primary)] text-sm min-w-[100px] text-right">{order.total.toLocaleString()} FCFA</span>
                      <select value={order.status} onChange={(e) => handleStatus(order.id, e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                        {statusList.map((s) => <option key={s} value={s}>{statusMeta[s]?.label || s}</option>)}
                      </select>
                      {canAssign(order) && (
                        <Button variant="outline" size="sm" onClick={() => setAssignOrder(order)} className="gap-1.5 whitespace-nowrap">
                          <Truck className="w-3.5 h-3.5" /> Assigner
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {assignOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setAssignOrder(null)}>
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-[var(--border)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Assigner un livreur</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">Commande #{assignOrder.orderNumber || assignOrder.id.slice(0, 8)}</p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <Label>Livreur</Label>
                <select value={selectedDeliveryPerson} onChange={(e) => setSelectedDeliveryPerson(e.target.value)} required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                  <option value="">Sélectionner...</option>
                  {deliveryPersons.map((dp) => <option key={dp.id} value={dp.id}>{dp.name || dp.phone}</option>)}
                </select>
              </div>
              <div>
                <Label>Temps estimé (minutes)</Label>
                <Input type="number" min="1" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="ex: 30" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setAssignOrder(null)}>Annuler</Button>
                <Button type="submit" disabled={assigning} className="gap-2"><Truck className="w-4 h-4" />{assigning ? "Assignation..." : "Assigner"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
