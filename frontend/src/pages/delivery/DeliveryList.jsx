import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bike, MapPin, Clock, ChevronRight } from "lucide-react";

const statusLabels = {
  assigned: "Assignée",
  picked_up: "Ramassée",
  in_transit: "En transit",
  delivered: "Livrée",
};

const statusColors = {
  assigned: "bg-yellow-100 text-yellow-800",
  picked_up: "bg-blue-100 text-blue-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bike className="w-6 h-6 text-[#e67e22]" />
        <h1 className="text-2xl font-bold">Mes livraisons</h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-2">
        <button onClick={() => setTab("active")} className={`pb-2 text-sm font-medium border-b-2 ${tab === "active" ? "border-[#e67e22] text-[#e67e22]" : "border-transparent text-[var(--muted-foreground)]"}`}>
          Actives ({active.length})
        </button>
        <button onClick={() => setTab("history")} className={`pb-2 text-sm font-medium border-b-2 ${tab === "history" ? "border-[#e67e22] text-[#e67e22]" : "border-transparent text-[var(--muted-foreground)]"}`}>
          Historique ({history.length})
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)]">
          <Bike className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-3" />
          <p>Aucune livraison</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/delivery/${d.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{d.order?.orderNumber || d.orderId?.slice(0, 8)}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{statusLabels[d.status]}</span>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)] space-y-0.5">
                      {d.order?.restaurant && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.order.restaurant.name} - {d.order.restaurant.address}</p>}
                      {d.order?.deliveryAddress && <p className="flex items-center gap-1 ml-4">→ {d.order.deliveryAddress}</p>}
                      {d.order?.items && <p className="text-xs">{d.order.items.length} article(s)</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
