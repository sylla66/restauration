import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike, MapPin, Clock, ChevronRight, Store, Package, CheckCircle } from "lucide-react";

const statusMeta = {
  assigned: { label: "Assignée", variant: "warning", icon: Clock },
  picked_up: { label: "Ramassée", variant: "info", icon: Package },
  in_transit: { label: "En transit", variant: "warning", icon: Bike },
  delivered: { label: "Livrée", variant: "secondary", icon: CheckCircle },
};

export default function DeliveryList() {
  const navigate = useNavigate();
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    deliveries.my().then((res) => {
      const all = res.deliveries || [];
      setActive(all.filter((d) => d.status !== "delivered"));
      setHistory(all.filter((d) => d.status === "delivered"));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const items = tab === "active" ? active : history;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
          <Bike className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mes livraisons</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{active.length} active{active.length > 1 ? "s" : ""}, {history.length} terminée{history.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--muted)] w-fit">
        <button onClick={() => setTab("active")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "active" ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
          Actives ({active.length})
        </button>
        <button onClick={() => setTab("history")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "history" ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
          Historique ({history.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl animate-shimmer" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Bike className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="font-semibold">Aucune livraison</p>
          <p className="text-sm text-[var(--muted-foreground)]">{tab === "active" ? "En attente d'assignation" : "Pas d'historique"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((d) => {
            const m = statusMeta[d.status] || statusMeta.assigned;
            const Icon = m.icon;
            return (
              <Card key={d.id} hover className="cursor-pointer" onClick={() => navigate(`/delivery/${d.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${d.status === "delivered" ? "bg-green-500" : "bg-gradient-primary"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">#{d.order?.orderNumber || d.orderId?.slice(0, 8)}</p>
                        <Badge variant={m.variant} size="sm" dot>{m.label}</Badge>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1 space-y-0.5">
                        {d.order?.restaurant && <p className="flex items-center gap-1"><Store className="w-3 h-3" /> {d.order.restaurant.name}</p>}
                        {d.order?.deliveryAddress && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.order.deliveryAddress}</p>}
                        {d.order?.items && <p>{d.order.items.length} article(s)</p>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
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
