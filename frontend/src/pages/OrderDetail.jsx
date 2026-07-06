import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orders } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orders.getById(id).then((res) => setOrder(res.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  if (!order) return <div className="text-center py-12 text-gray-500">Commande introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-[#e67e22] mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-bold mb-2">Commande #{order.reference || order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500 mb-4">{new Date(order.createdAt).toLocaleDateString("fr-FR")} - {new Date(order.createdAt).toLocaleTimeString("fr-FR")}</p>

          <div className="space-y-3 mb-6">
            {order.items?.map((item) => (
              <div key={item.id || item.menuItemId} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-[#e67e22]">{order.total.toLocaleString()} FCFA</span>
          </div>

          {order.status === "PENDING" && (
            <Button variant="danger" className="mt-4" onClick={() => orders.cancel(order.id).then(() => setOrder({ ...order, status: "CANCELLED" }))}>
              Annuler la commande
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
