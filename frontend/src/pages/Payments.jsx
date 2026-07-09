import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orders, payments } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    orders.list({}).then((res) => setOrderList(res.orders || [])).finally(() => setLoading(false));
  }, [user]);

  async function showPayments(orderId) {
    setSelectedOrder(orderId);
    try {
      const res = await payments.listByOrder(orderId);
      setPaymentList(res.payments || []);
    } catch {
      setPaymentList([]);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-[#e67e22]" /> Paiements
      </h1>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : orderList.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)]">Aucune commande</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orderList.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString("fr-FR")} - {order.total} FCFA</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showPayments(order.id)}>Voir paiements</Button>
                </div>

                {selectedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    {paymentList.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">Aucun paiement enregistré</p>
                    ) : (
                      <div className="space-y-2">
                        {paymentList.map((p) => (
                          <div key={p.id} className="flex justify-between text-sm p-2 bg-[var(--muted)] rounded">
                            <div>
                              <p className="font-medium">{p.method}</p>
                              <p className="text-xs text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleString("fr-FR")}</p>
                              {p.transactionId && <p className="text-xs text-[var(--muted-foreground)]">Ref: {p.transactionId}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{p.amount} FCFA</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "COMPLETED" ? "bg-green-100 text-green-700" : p.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
