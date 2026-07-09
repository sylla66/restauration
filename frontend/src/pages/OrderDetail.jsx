import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orders, deliveries, reviews, complaints } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useSocket } from "@/context/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ArrowLeft, Star, MessageSquare, AlertTriangle, Truck, Printer } from "lucide-react";

const statusSteps = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"];

const printStyles = `
  @media print {
    header, nav, .print-hidden { display: none !important; }
    body { background: white !important; }
    .invoice-section { display: block !important; }
    .max-w-2xl { max-width: 100% !important; }
    .mx-auto { margin: 0 !important; }
    .space-y-6 > :not(.invoice-section) { display: none !important; }
    .invoice-section { display: block !important; padding: 0 !important; }
    .invoice-section .card { border: none !important; box-shadow: none !important; }
  }
`;

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { joinOrder, connected } = useSocket();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setPrintStyle] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);
    setPrintStyle(true);
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
      toast("Avis envoyé !");
      setShowReview(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setReviewing(false);
    }
  }

  async function handleComplaint(e) {
    e.preventDefault();
    setComplaining(true);
    try {
      await complaints.create({ orderId: id, reason: complaintReason, description: complaintDesc || undefined });
      toast("Réclamation envoyée.");
      setComplaintSent(true);
      setShowComplaint(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setComplaining(false);
    }
  }

  const currentStep = statusSteps.indexOf(order?.status || "PENDING");
  const isDeliveredOrCancelled = order?.status === "DELIVERED" || order?.status === "CANCELLED";

  if (loading) return <div className="text-center py-12 text-[var(--muted-foreground)]">Chargement...</div>;
  if (!order) return <div className="text-center py-12 text-[var(--muted-foreground)]">Commande introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/orders" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[#e67e22]">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold">Commande #{order.orderNumber || order.id.slice(0, 8)}</h1>
              <p className="text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString("fr-FR")} - {new Date(order.createdAt).toLocaleTimeString("fr-FR")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">{order.status}</span>
              {(user.role === "ADMIN" || user.role === "GERANT") && (
                <Button variant="outline" size="sm" onClick={() => window.print()} className="print-hidden"><Printer className="w-4 h-4" /></Button>
              )}
            </div>
          </div>

          {order.channel === "delivery" && order.deliveryAddress && (
            <p className="text-sm text-[var(--muted-foreground)] mb-4"><Truck className="w-4 h-4 inline mr-1" /> Livraison : {order.deliveryAddress}</p>
          )}

          {order.status !== "CANCELLED" && (
            <div className="flex gap-1 mb-6 overflow-x-auto">
              {statusSteps.map((s, i) => (
                <div key={s} className={`flex-1 h-2 rounded-full ${i <= currentStep ? "bg-[#2ecc71]" : "bg-[var(--muted)]"}`} />
              ))}
            </div>
          )}

          <div className="space-y-3 mb-4">
            {order.items?.map((item) => (
              <div key={item.id || item.menuItemId} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.unitPrice || item.price) * item.quantity} FCFA</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1 text-sm">
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Frais de livraison</span>
                <span>{order.deliveryFee} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#e67e22]">{order.total} FCFA</span>
            </div>
          </div>

          {order.status === "PENDING" && (
            <Button variant="danger" className="mt-4" onClick={() => orders.cancel(order.id).then(() => { toast("Commande annulée"); setOrder({ ...order, status: "CANCELLED" }); }).catch((err) => toast(err.message, "error"))}>
              Annuler la commande
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="invoice-section hidden space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold">{order.restaurant?.name || "Restaurant"}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{order.restaurant?.address}</p>
              {order.restaurant?.phone && <p className="text-sm text-[var(--muted-foreground)]">Tél: {order.restaurant.phone}</p>}
            </div>
            <div className="text-center text-sm mb-3">
              <p className="font-medium">FACTURE</p>
              <p>N° {order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
              <p>{new Date(order.createdAt).toLocaleDateString("fr-FR")} - {new Date(order.createdAt).toLocaleTimeString("fr-FR")}</p>
            </div>
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Article</th>
                  <th className="text-center py-1">Qté</th>
                  <th className="text-right py-1">Prix</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id || item.menuItemId} className="border-b border-dashed border-gray-200">
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">{(item.unitPrice || item.price) * item.quantity} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span>Frais de livraison</span>
                <span>{order.deliveryFee} FCFA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2">
              <span>Total</span>
              <span>{order.total} FCFA</span>
            </div>
            <div className="text-center text-xs text-[var(--muted-foreground)] mt-4 border-t pt-2">
              <p>Merci de votre confiance !</p>
              {order.channel === "delivery" && order.deliveryAddress && <p>Livré à : {order.deliveryAddress}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {delivery && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-4 h-4" /> Livraison</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Statut</span>
              <span className="font-medium">{delivery.status}</span>
            </div>
            {delivery.deliveryPerson && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[var(--muted-foreground)]">Livreur</span>
                <span>{delivery.deliveryPerson.name}</span>
              </div>
            )}
            {delivery.estimatedTime && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[var(--muted-foreground)]">Temps estimé</span>
                <span>{delivery.estimatedTime} min</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "DELIVERED" && !isDeliveredOrCancelled === false && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-4 h-4" /> Noter la commande</CardTitle></CardHeader>
          <CardContent>
            {!showReview ? (
              <Button onClick={() => setShowReview(true)}>Donner mon avis</Button>
            ) : (
              <form onSubmit={handleReview} className="space-y-3">
                <div>
                  <Label>Note</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setRating(s)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= rating ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Commentaire (optionnel)</Label>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Votre avis..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={reviewing}>{reviewing ? "Envoi..." : "Envoyer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowReview(false)}>Annuler</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {!complaintSent && order.status !== "CANCELLED" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Réclamation</CardTitle></CardHeader>
          <CardContent>
            {!showComplaint ? (
              <Button variant="outline" onClick={() => setShowComplaint(true)}>Signaler un problème</Button>
            ) : (
              <form onSubmit={handleComplaint} className="space-y-3">
                <div>
                  <Label>Motif</Label>
                  <select value={complaintReason} onChange={(e) => setComplaintReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22]" required>
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
                  <Button type="submit" variant="danger" disabled={complaining || !complaintReason}>{complaining ? "Envoi..." : "Envoyer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowComplaint(false)}>Annuler</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
