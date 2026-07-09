import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bike, MapPin, ChevronRight } from "lucide-react";

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

export default function AdminDeliveries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    deliveries.list({}).then((res) => setList(res.deliveries || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? list.filter((d) => d.status === filter) : list;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bike className="w-5 h-5" /> Livraisons</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>Toutes</button>
        {Object.keys(statusLabels).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>{statusLabels[s]}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)]">
          <Bike className="w-12 h-12 mx-auto mb-3" />
          <p>Aucune livraison</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/delivery/${d.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{d.order?.orderNumber || d.orderId?.slice(0, 8)}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{statusLabels[d.status]}</span>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)] space-y-0.5">
                      {d.order?.restaurant && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.order.restaurant.name}</p>}
                      {d.deliveryPerson && <p className="text-xs">Livreur : {d.deliveryPerson.name}</p>}
                      {d.order?.deliveryAddress && <p className="text-xs">→ {d.order.deliveryAddress}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
