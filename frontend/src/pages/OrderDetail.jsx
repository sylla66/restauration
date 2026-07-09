import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orders, deliveries, reviews, complaints } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useSocket } from "@/context/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { ArrowLeft, Star, AlertTriangle, Truck, Printer, Clock, MapPin, CheckCircle, XCircle, ChefHat, UtensilsCrossed } from "lucide-react";

const statusMeta = {
  PENDING: { label: "En attente", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock, step: 0 },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle, step: 1 },
  PREPARING: { label: "En préparation", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ChefHat, step: 2 },
  READY: { label: "Prête", color: "bg-purple-50 text-purple-700 border-purple-200", icon: UtensilsCrossed, step: 3 },
  READY_FOR_PICKUP: { label: "Prête (retrait)", color: "bg-teal-50 text-teal-700 border-teal-200", icon: CheckCircle, step: 3 },
  OUT_FOR_DELIVERY: { label: "En livraison", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Truck, step: 4 },
  DELIVERED: { label: "Livrée", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle, step: 5 },
  CANCELLED: { label: "Annulée", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, step: -1 },
};

const printStyles = `
  @media print {
    header, nav, .print-hidden { display: none !important; }
    body { background: white !important; color: black !important; }
    .no-print { display: none !important; }
    .invoice-section { display: block !important; }
    @page { margin: 1.5cm; }
  }
`;

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { joinOrder } = useSocket();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [complaintReason, setComplaintReason] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaining, setComplaining] = useState(false);
  const [complaintSent, setComplaintSent] = useState(false);

  useEffect(() => {
    orders.getById(id).then((res) => { setOrder(res.order); joinOrder(id); }).catch(() => setOrder(null));
    deliveries.getByOrder(id).then((res) => setDelivery(res.delivery)).catch(() => {});
    setLoading(false);
  }, [id]);

  async function handleReview(e) {
    e.preventDefault();
    setReviewing(true);
    try {
      await reviews.create({ orderId: id, rating, comment: comment || undefined });
      toast("Merci pour votre avis !");
      setShowReview(false);
    } catch (err) { toast(err.message, "error"); } finally { setReviewing(false); }
  }

  async function handleComplaint(e) {
    e.preventDefault();
    setComplaining(true);
    try {
      await complaints.create({ orderId: id, reason: complaintReason, description: complaintDesc || undefined });
      toast("Réclamation envoyée.");
      setComplaintSent(true);
      setShowComplaint(false);
    } catch (err) { toast(err.message, "error"); } finally { setComplaining(false); }
  }

  if (loading) return <div className="text-center py-16"><div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mx-auto" /></div>;
  if (!order) return (
    <div className="text-center py-20 animate-fade-in">
      <XCircle className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
      <h2 className="text-xl font-bold mb-2">Commande introuvable</h2>
      <Link to="/orders"><Button variant="outline" className="mt-4">Mes commandes</Button></Link>
    </div>
  );

  const meta = statusMeta[order.status] || statusMeta.PENDING;
  const StatusIcon = meta.icon;
  const showDelivery = order.channel === "REMOTE" && order.subType === "DELIVERY";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link to="/orders" className="no-print inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour aux commandes
      </Link>

      <Card className="overflow-hidden">
        <div className={`h-2 ${order.status === "CANCELLED" ? "bg-red-500" : "bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]"}`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-extrabold">#{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</h1>
                <Badge variant={order.status === "CANCELLED" ? "danger" : order.status === "DELIVERED" ? "secondary" : "warning"} dot>{meta.label}</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} à {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
              {order.restaurant && <p className="text-sm font-medium mt-1">{order.restaurant.name}</p>}
            </div>
            {(user?.role === "ADMIN" || user?.role === "GERANT") && (
              <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print gap-1.5"><Printer className="w-3.5 h-3.5" /> Imprimer</Button>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--muted)] mb-6 no-print">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md ${order.status === "CANCELLED" ? "from-red-500 to-red-600" : "from-[var(--primary)] to-orange-500"}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">{meta.label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{showDelivery ? "Livraison" : order.subType === "TAKEAWAY" ? "À emporter" : "Sur place"}</p>
            </div>
          </div>

          {showDelivery && order.deliveryAddress && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 mb-6">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div><p className="text-sm font-medium">Adresse de livraison</p><p className="text-sm text-[var(--muted-foreground)]">{order.deliveryAddress}</p></div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {order.items?.map((item) => (
              <div key={item.id || item.menuItemId} className="flex items-center justify-between p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <span className="font-semibold text-sm">{((item.unitPrice || item.price) * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-2">
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                <span>Frais de livraison</span>
                <span>{order.deliveryFee.toLocaleString()} FCFA</span>
              </div>
            )}
            {order.deliveryFee > 0 && <div className="border-t border-dashed border-[var(--border)]" />}
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Total</span>
              <span className="text-xl font-extrabold text-[var(--primary)]">{order.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {order.status === "PENDING" && (
            <Button variant="danger" size="sm" className="mt-6 no-print gap-1.5" onClick={() => orders.cancel(order.id).then(() => { toast("Commande annulée"); setOrder({ ...order, status: "CANCELLED" }); }).catch((err) => toast(err.message, "error"))}>
              <XCircle className="w-4 h-4" /> Annuler la commande
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="invoice-section hidden space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-black mb-1">{order.restaurant?.name || "Restaurant"}</h2>
              <p className="text-sm text-gray-500">{order.restaurant?.address}</p>
              {order.restaurant?.phone && <p className="text-sm text-gray-500">Tél: {order.restaurant.phone}</p>}
            </div>
            <div className="text-center text-sm mb-6">
              <p className="text-lg font-bold uppercase tracking-widest">Facture</p>
              <p className="text-gray-500">N° {order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")} - {new Date(order.createdAt).toLocaleTimeString("fr-FR")}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-xs uppercase tracking-wider text-gray-500">Article</th>
                  <th className="text-center py-2 text-xs uppercase tracking-wider text-gray-500">Qté</th>
                  <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-500">Prix</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id || item.menuItemId} className="border-b border-dashed border-gray-200">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2 font-medium">{((item.unitPrice || item.price) * item.quantity).toLocaleString()} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm mb-1 py-1">
                <span>Frais de livraison</span>
                <span>{order.deliveryFee.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-3 mt-2">
              <span>Total</span>
              <span>{order.total.toLocaleString()} FCFA</span>
            </div>
            <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
              <p className="font-medium text-gray-600">Merci de votre confiance !</p>
              {showDelivery && order.deliveryAddress && <p className="mt-1">Livré à : {order.deliveryAddress}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {delivery && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-[var(--primary)]" /> Livraison</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Statut</p>
                <Badge variant={delivery.status === "delivered" ? "secondary" : delivery.status === "assigned" ? "warning" : "info"} dot size="sm">{delivery.status}</Badge>
              </div>
              {delivery.deliveryPerson && (
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Livreur</p>
                  <p className="font-semibold text-sm">{delivery.deliveryPerson.name}</p>
                </div>
              )}
              {delivery.estimatedTime && (
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Temps estimé</p>
                  <p className="font-semibold text-sm">{delivery.estimatedTime} min</p>
                </div>
              )}
              {delivery.deliveredAt && (
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Livré le</p>
                  <p className="font-semibold text-sm">{new Date(delivery.deliveredAt).toLocaleString("fr-FR")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {order.status === "DELIVERED" && !complaintSent && (
        <Card className="overflow-hidden no-print">
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-bold text-sm">Donnez votre avis</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Notez votre expérience</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowReview(!showReview)}>{showReview ? "Fermer" : "Noter"}</Button>
            </div>
            {showReview && (
              <form onSubmit={handleReview} className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
                <div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setRating(s)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${s <= rating ? "bg-[var(--primary)] text-white shadow-md scale-110" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary-light)]"}`}>
                        {s <= rating ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Commentaire (optionnel)</Label>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partagez votre expérience..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={reviewing} size="sm">{reviewing ? "Envoi..." : "Envoyer"}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {order.status !== "CANCELLED" && !complaintSent && (
        <Card className="overflow-hidden no-print">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-bold text-sm">Un problème ?</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Signaler une réclamation</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowComplaint(!showComplaint)}>{showComplaint ? "Fermer" : "Signaler"}</Button>
            </div>
            {showComplaint && (
              <form onSubmit={handleComplaint} className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
                <div>
                  <Label>Motif</Label>
                  <select value={complaintReason} onChange={(e) => setComplaintReason(e.target.value)} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" required>
                    <option value="">Sélectionner...</option>
                    <option value="retard">Retard de livraison</option>
                    <option value="qualite">Qualité du repas</option>
                    <option value="erreur">Erreur dans la commande</option>
                    <option value="livreur">Problème livreur</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <Label>Description (optionnel)</Label>
                  <Input value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder="Décrivez le problème..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="danger" size="sm" disabled={complaining || !complaintReason}>{complaining ? "Envoi..." : "Envoyer la réclamation"}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
