import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { deliveries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bike, MapPin, Phone, Clock, CheckCircle, Package, Truck } from "lucide-react";

const transitions = {
  assigned: { next: "picked_up", label: "Ramasser la commande", icon: Package },
  picked_up: { next: "in_transit", label: "En route vers livraison", icon: Truck },
  in_transit: { next: "delivered", label: "Marquer comme livrée", icon: CheckCircle },
};

const statusLabels = {
  assigned: "Assignée",
  picked_up: "Ramassée",
  in_transit: "En transit",
  delivered: "Livrée",
};

const steps = ["assigned", "picked_up", "in_transit", "delivered"];

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    deliveries.list({}).then((res) => {
      const found = (res.deliveries || []).find((d) => d.id === id);
      if (found) setDelivery(found);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleTransition() {
    const transition = transitions[delivery.status];
    if (!transition || !confirm(`${transition.label} ?`)) return;
    setUpdating(true);
    try {
      const res = await deliveries.updateStatus(id, transition.next);
      setDelivery(res.delivery);
      toast(`Livraison : ${transition.label}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  if (!delivery) return <div className="text-center py-12 text-gray-500">Livraison introuvable</div>;

  const currentStep = steps.indexOf(delivery.status);
  const order = delivery.order;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/delivery" className="flex items-center gap-2 text-gray-500 hover:text-[#e67e22]">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bike className="w-5 h-5 text-[#e67e22]" />
            <div>
              <h1 className="text-xl font-bold">Livraison #{delivery.order?.orderNumber || delivery.orderId?.slice(0, 8)}</h1>
              <p className="text-sm text-gray-500">Statut : {statusLabels[delivery.status]}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-6">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-2 rounded-full ${i <= currentStep ? "bg-[#2ecc71]" : "bg-gray-200"}`} />
            ))}
          </div>

          <div className="space-y-3">
            {order?.restaurant && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{order.restaurant.name}</p>
                  <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                  {order.restaurant.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{order.restaurant.phone}</p>}
                </div>
              </div>
            )}

            {order?.deliveryAddress && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <MapPin className="w-4 h-4 text-[#e67e22] mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Livraison</p>
                  <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                </div>
              </div>
            )}

            {order?.items && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm mb-2">Articles</p>
                {order.items.map((item) => (
                  <div key={item.id || item.menuItemId} className="flex justify-between text-sm text-gray-600">
                    <span>{item.menuItem?.name || "Article"} x{item.quantity}</span>
                    <span>{(item.unitPrice || 0) * item.quantity} FCFA</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 mt-2 pt-2">
                  <span>Total</span>
                  <span className="text-[#e67e22]">{order.total} FCFA</span>
                </div>
              </div>
            )}

            {delivery.estimatedTime && (
              <p className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Temps estimé : {delivery.estimatedTime} min</p>
            )}
          </div>

          {transitions[delivery.status] && (
            <Button className="w-full mt-6" size="lg" onClick={handleTransition} disabled={updating}>
              {updating ? "Mise à jour..." : transitions[delivery.status].label}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
