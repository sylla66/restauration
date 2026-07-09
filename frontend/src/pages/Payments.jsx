import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orders, payments } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ChevronDown, ChevronUp, Wallet, CheckCircle, XCircle } from "lucide-react";

const paymentStatusMeta = {
  COMPLETED: { label: "Payé", variant: "secondary" },
  SUCCEEDED: { label: "Réussi", variant: "secondary" },
  PENDING: { label: "En attente", variant: "warning" },
  FAILED: { label: "Échoué", variant: "danger" },
  CANCELLED: { label: "Annulé", variant: "default" },
};

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    orders.list({}).then((res) => setOrderList(res.orders || [])).finally(() => setLoading(false));
  }, [user]);

  async function togglePayments(orderId) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    try {
      const res = await payments.listByOrder(orderId);
      setPaymentData((prev) => ({ ...prev, [orderId]: res.payments || [] }));
    } catch { setPaymentData((prev) => ({ ...prev, [orderId]: [] })); }
  }

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)}</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Paiements</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{orderList.length} commande{orderList.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {orderList.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="font-semibold">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => {
            const isExpanded = expandedId === order.id;
            const payments = paymentData[order.id];
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {order.orderNumber?.slice(0, 2) || "##"}
                      </div>
                      <div>
                        <p className="font-bold text-sm">#{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString("fr-FR")} • {order.total.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => togglePayments(order.id)} className="gap-1.5">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Paiements
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
                      {!payments ? (
                        <p className="text-sm text-[var(--muted-foreground)]">Chargement...</p>
                      ) : payments.length === 0 ? (
                        <div className="text-center py-4 text-sm text-[var(--muted-foreground)]">
                          <CreditCard className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]/50" />
                          <p>Aucun paiement</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {payments.map((p) => {
                            const pm = paymentStatusMeta[p.status] || paymentStatusMeta.PENDING;
                            return (
                              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${p.status === "COMPLETED" || p.status === "SUCCEEDED" ? "bg-green-500" : p.status === "FAILED" ? "bg-red-500" : "bg-yellow-500"}`}>
                                  {p.status === "COMPLETED" || p.status === "SUCCEEDED" ? <CheckCircle className="w-4 h-4" /> : p.status === "FAILED" ? <XCircle className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{p.method}</p>
                                    <Badge variant={pm.variant} size="sm">{pm.label}</Badge>
                                  </div>
                                  <p className="text-xs text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleString("fr-FR")}</p>
                                  {p.transactionId && <p className="text-xs text-[var(--muted-foreground)]">Ref: {p.transactionId}</p>}
                                </div>
                                <p className="font-bold text-sm">{p.amount.toLocaleString()} FCFA</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
