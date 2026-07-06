import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboard, orders } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, XCircle, Clock, List } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [cancellations, setCancellations] = useState(null);
  const [deliveryTimes, setDeliveryTimes] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return navigate("/");

    const today = new Date().toISOString().slice(0, 10);

    dashboard.sales({ startDate: today, endDate: today }).then(setSales).catch(() => {});
    dashboard.topItems({ startDate: today, endDate: today }).then((r) => setTopItems(r.items || [])).catch(() => {});
    dashboard.cancellations({ startDate: today, endDate: today }).then((r) => setCancellations(r)).catch(() => {});
    dashboard.deliveryTimes({ startDate: today, endDate: today }).then((r) => setDeliveryTimes(r)).catch(() => {});
    orders.list({ limit: "5" }).then((r) => setRecentOrders(r.orders || [])).catch(() => {});
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={DollarSign} title="Ventes du jour" value={sales ? `${sales.totalSales?.toLocaleString() || 0} FCFA` : "..."} />
        <MetricCard icon={TrendingUp} title="Top plat" value={topItems[0]?.name || "..."} />
        <MetricCard icon={XCircle} title="Annulations" value={cancellations ? `${cancellations.count || 0}` : "..."} />
        <MetricCard icon={Clock} title="Temps moyen" value={deliveryTimes ? `${Math.round(deliveryTimes.average || 0)} min` : "..."} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><List className="w-4 h-4" /> Dernières commandes</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune commande récente</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                  <span className="font-medium">#{o.orderNumber || o.id.slice(0, 8)}</span>
                  <span className="text-gray-500">{new Date(o.createdAt).toLocaleTimeString("fr-FR")}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.status === "DELIVERED" ? "bg-green-100 text-green-700" : o.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                  <span className="font-bold text-[#e67e22]">{o.total} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Icon className="w-5 h-5 text-[#e67e22]" />
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
