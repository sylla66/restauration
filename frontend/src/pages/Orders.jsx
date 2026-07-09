import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orders } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Truck } from "lucide-react";

const statusBadge = {
  PENDING: { label: "En attente", class: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmée", class: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "En préparation", class: "bg-orange-100 text-orange-800" },
  READY: { label: "Prête", class: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Livrée", class: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", class: "bg-red-100 text-red-800" },
};

const statusIcon = {
  PENDING: Clock,
  CONFIRMED: Clock,
  PREPARING: Clock,
  READY: CheckCircle,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
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
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-12 text-[var(--muted-foreground)]">Chargement...</div>;

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      {list.length === 0 ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Aucune commande</p>
      ) : (
        <div className="space-y-4">
          {list.map((order) => {
            const Icon = statusIcon[order.status] || Clock;
            const badge = statusBadge[order.status] || statusBadge.PENDING;
            return (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/orders/${order.id}`)}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="font-medium">#{order.reference || order.id.slice(0, 8)}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.class}`}>{badge.label}</span>
                      <span className="font-bold text-[#e67e22]">{order.total.toLocaleString()} FCFA</span>
                      {order.status === "PENDING" && (
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }}>
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
