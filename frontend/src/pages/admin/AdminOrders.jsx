import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { orders } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Search } from "lucide-react";

const statusList = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    orders.list({}).then((res) => setList(res.orders || [])).finally(() => setLoading(false));
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#e67e22] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Toutes</button>
        {statusList.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? "bg-[#e67e22] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Aucune commande</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
                      {order.user?.name && <p className="text-xs text-gray-500">{order.user.name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="font-bold text-sm">{order.total} FCFA</span>
                    <select value={order.status} onChange={(e) => handleStatus(order.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                      {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}><Search className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
