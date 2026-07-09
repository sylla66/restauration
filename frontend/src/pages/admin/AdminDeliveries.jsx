import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deliveries } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike, MapPin, User, Clock, ArrowRight, Package, CheckCircle } from "lucide-react";

const statusMeta = {
  assigned: { label: "Assignée", variant: "warning", icon: Clock },
  picked_up: { label: "Ramassée", variant: "info", icon: Package },
  in_transit: { label: "En transit", variant: "warning", icon: Bike },
  delivered: { label: "Livrée", variant: "secondary", icon: CheckCircle },
};

export default function AdminDeliveries() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    deliveries.list({}).then((res) => setList(res.deliveries || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? list.filter((d) => d.status === filter) : list;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bike className="w-6 h-6 text-[var(--primary)]" /> Livraisons</h1>
        <Badge variant="primary" size="sm">{list.length} livraison{list.length > 1 ? "s" : ""}</Badge>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ value: "", label: "Toutes" }, ...Object.entries(statusMeta).map(([k, v]) => ({ value: k, label: v.label }))].map((r) => (
          <button key={r.value} onClick={() => setFilter(r.value)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === r.value ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>{r.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Bike className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" /><p className="font-semibold">Aucune livraison</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const m = statusMeta[d.status] || statusMeta.assigned;
            const Icon = m.icon;
            return (
              <Card key={d.id} hover className="cursor-pointer" onClick={() => navigate(`/delivery/${d.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${d.status === "delivered" ? "bg-green-500" : "bg-gradient-primary"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">#{d.order?.orderNumber || d.orderId?.slice(0, 8)}</p>
                      <Badge variant={m.variant} size="sm" dot>{m.label}</Badge>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    {d.order?.restaurant && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {d.order.restaurant.name}</p>}
                    {d.deliveryPerson && <p className="flex items-center gap-1.5"><User className="w-3 h-3" /> {d.deliveryPerson.name}</p>}
                    {d.order?.deliveryAddress && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {d.order.deliveryAddress}</p>}
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
