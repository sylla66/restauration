import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { orders, users, deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Clock, Search, Truck } from "lucide-react";

const statusList = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-purple-100 text-purple-800",
  READY_FOR_PICKUP: "bg-teal-100 text-teal-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
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
      toast(`Commande passée à ${status}`);
    } catch (err) {
      toast(err.message, "error");
    }
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
      toast("Livreur assigné avec succès");
      setAssignOrder(null);
      setSelectedDeliveryPerson("");
      setEstimatedTime("");
      const res = await orders.list({});
      setList(res.orders || []);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>Toutes</button>
        {statusList.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Aucune commande</p>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
                      {order.user?.name && <p className="text-xs text-[var(--muted-foreground)]">{order.user.name}</p>}
                      <p className="text-xs text-[var(--muted-foreground)]">{order.channel === "REMOTE" ? (order.subType === "DELIVERY" ? "Livraison" : "À emporter") : "Sur place"}</p>
                      {order.delivery?.deliveryPerson && <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><Truck className="w-3 h-3" /> {order.delivery.deliveryPerson.name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="font-bold text-sm">{order.total} FCFA</span>
                    <select value={order.status} onChange={(e) => handleStatus(order.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                      {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {canAssign(order) && (
                      <Button variant="outline" size="sm" onClick={() => setAssignOrder(order)} className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Assigner
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}><Search className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assignOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setAssignOrder(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Assigner un livreur</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">Commande #{assignOrder.orderNumber || assignOrder.id.slice(0, 8)}</p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <Label>Livreur</Label>
                <select value={selectedDeliveryPerson} onChange={(e) => setSelectedDeliveryPerson(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Sélectionner...</option>
                  {deliveryPersons.map((dp) => <option key={dp.id} value={dp.id}>{dp.name || dp.phone}</option>)}
                </select>
              </div>
              <div>
                <Label>Temps estimé (minutes, optionnel)</Label>
                <Input type="number" min="1" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="ex: 30" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setAssignOrder(null)}>Annuler</Button>
                <Button type="submit" disabled={assigning}>{assigning ? "Assignation..." : "Assigner"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
