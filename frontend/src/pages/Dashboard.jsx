import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboard, orders } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, XCircle, Clock, ArrowRight, ShoppingCart, CheckCircle, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [cancellations, setCancellations] = useState(null);
  const [deliveryTimes, setDeliveryTimes] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "GERANT")) return navigate("/");
    dashboard.sales({ period: "day" }).then(setSalesData).catch(() => {});
    dashboard.topItems({ period: "day" }).then((r) => setTopItems(r.topItems || [])).catch(() => {});
    dashboard.cancellations({ period: "day" }).then(setCancellations).catch(() => {});
    dashboard.deliveryTimes({ period: "day" }).then(setDeliveryTimes).catch(() => {});
    orders.list({ limit: "5" }).then((r) => setRecentOrders(r.orders || [])).catch(() => {});
  }, [user]);

  const statusBadge = {
    DELIVERED: "secondary", CANCELLED: "danger", PENDING: "warning",
    CONFIRMED: "info", PREPARING: "warning", READY: "info", OUT_FOR_DELIVERY: "info",
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {user?.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Voici votre tableau de bord du jour</p>
        </div>
        <Badge variant="primary" size="lg">{user?.role === "GERANT" ? "Gérant" : "Administrateur"}</Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Ventes du jour" value={salesData ? `${(salesData.totalRevenue || 0).toLocaleString()} FCFA` : "..."} icon={DollarSign} gradient="orange" subtitle={`${salesData?.orderCount || 0} commandes`} />
        <StatCard label="Top plat" value={topItems[0]?.name || "Aucune vente"} icon={TrendingUp} gradient="blue" subtitle={topItems[0] ? `${topItems[0].totalSold} vendus` : ""} />
        <StatCard label="Annulations" value={cancellations ? `${cancellations.rate || 0}%` : "..."} icon={XCircle} gradient="red" subtitle={`${cancellations?.cancelledOrders || 0} commandes`} />
        <StatCard label="Temps livraison" value={deliveryTimes ? `${deliveryTimes.averageDeliveryTimeMin || 0} min` : "..."} icon={Clock} gradient="purple" subtitle={deliveryTimes ? `${deliveryTimes.totalDeliveries} livraisons` : ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[var(--primary)]" /> Dernières commandes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="text-[var(--muted-foreground)] text-center py-8">Aucune commande récente</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-4 p-4 hover:bg-[var(--muted)] cursor-pointer transition-colors" onClick={() => navigate(`/orders/${o.id}`)}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${o.status === "DELIVERED" ? "bg-green-500" : o.status === "CANCELLED" ? "bg-red-500" : "bg-[var(--primary)]"}`}>
                      {o.status === "DELIVERED" ? <CheckCircle className="w-5 h-5" /> : o.status === "CANCELLED" ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">#{o.orderNumber || o.id.slice(0, 8)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{o.user?.name} • {new Date(o.createdAt).toLocaleTimeString("fr-FR")}</p>
                    </div>
                    <Badge variant={statusBadge[o.status] || "default"} size="sm">{o.status}</Badge>
                    <span className="font-bold text-sm text-[var(--primary)]">{o.total.toLocaleString()} FCFA</span>
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {topItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--primary)]" /> Top plats du jour
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {topItems.slice(0, 5).map((item, i) => (
                  <div key={item.menuItemId} className="flex items-center gap-4 p-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-[var(--muted-foreground)]"}`}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-orange-400" style={{ width: `${Math.min(100, (item.totalSold / (topItems[0]?.totalSold || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">{item.totalSold}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[var(--primary)]">{item.totalRevenue.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
