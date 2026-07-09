import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { deliveries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bike, MapPin, Phone, Clock, CheckCircle, Package, Truck, Store } from "lucide-react";

const transitions = {
  assigned: { next: "picked_up", label: "Ramasser la commande", icon: Package },
  picked_up: { next: "in_transit", label: "En route vers livraison", icon: Truck },
  in_transit: { next: "delivered", label: "Marquer comme livrée", icon: CheckCircle },
};

const statusMeta = {
  assigned: { label: "Assignée", variant: "warning", icon: Clock },
  picked_up: { label: "Ramassée", variant: "info", icon: Package },
  in_transit: { label: "En transit", variant: "warning", icon: Truck },
  delivered: { label: "Livrée", variant: "secondary", icon: CheckCircle },
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
    deliveries.getById(id).then((res) => setDelivery(res.delivery)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function handleTransition() {
    const transition = transitions[delivery?.status];
    if (!transition || !confirm(`${transition.label} ?`)) return;
    setUpdating(true);
    try {
      const res = await deliveries.updateStatus(id, transition.next);
      setDelivery(res.delivery);
      toast(transition.label);
    } catch (err) { toast(err.message, "error"); } finally { setUpdating(false); }
  }

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl animate-shimmer" />)}</div>;
  if (!delivery) return (
    <div className="text-center py-16">
      <Bike className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
      <p className="font-semibold">Livraison introuvable</p>
    </div>
  );

  const order = delivery.order;
  const m = statusMeta[delivery.status] || statusMeta.assigned;
  const currentStep = steps.indexOf(delivery.status);
  const canAct = !!transitions[delivery.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link to="/delivery" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour aux livraisons
      </Link>

      <Card className="overflow-hidden">
        <div className={`h-2 ${delivery.status === "delivered" ? "bg-green-500" : "bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]"}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${delivery.status === "delivered" ? "bg-green-500" : "bg-gradient-primary"}`}>
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Livraison #{order?.orderNumber || order?.id?.slice(0, 8)}</h1>
                <Badge variant={m.variant} size="md" dot>{m.label}</Badge>
              </div>
            </div>
          </div>

          {delivery.status !== "delivered" && (
            <div className="flex gap-1 mb-6">
              {steps.map((s, i) => (
                <div key={s} className="relative flex-1">
                  <div className={`h-2 rounded-full ${i <= currentStep ? "bg-emerald-500" : "bg-[var(--muted)]"}`} />
                  <div className={`absolute -top-1.5 ${i <= currentStep ? "left-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md" : "left-1/2 w-3 h-3 rounded-full bg-[var(--muted)]"} -translate-x-1/2`} style={{ top: "-6px" }} />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {order?.restaurant && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--muted)]">
                <Store className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{order.restaurant.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{order.restaurant.address}</p>
                  {order.restaurant.phone && <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {order.restaurant.phone}</p>}
                </div>
              </div>
            )}

            {order?.deliveryAddress && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                <MapPin className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Adresse de livraison</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{order.deliveryAddress}</p>
                </div>
              </div>
            )}

            {order?.items && (
              <div className="p-4 rounded-xl bg-[var(--muted)]">
                <p className="font-semibold text-sm mb-2">Articles ({order.items.length})</p>
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id || item.menuItemId} className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">{item.menuItem?.name || "Article"} <span className="font-medium text-[var(--foreground)]">x{item.quantity}</span></span>
                      <span className="font-medium">{((item.unitPrice || 0) * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold border-t border-[var(--border)] mt-3 pt-3">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">{order.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            {delivery.estimatedTime && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--muted)]">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Temps estimé : <span className="text-[var(--primary)]">{delivery.estimatedTime} min</span></p>
              </div>
            )}
          </div>

          {canAct && (
            <Button className="w-full mt-6 gap-2" size="lg" onClick={handleTransition} disabled={updating}>
              {updating ? "Mise à jour..." : <>{transitions[delivery.status].label}</>}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
