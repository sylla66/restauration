import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { reviews } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X, MessageSquare } from "lucide-react";

export default function AdminReviews() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await reviews.listPending();
      setList(res.reviews || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleModerate(id, status) {
    try {
      await reviews.moderate(id, status);
      setList((prev) => prev.filter((r) => r.id !== id));
      toast(`Avis ${status === "APPROVED" ? "approuvé" : "rejeté"}`);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modération des avis</h1>

      <div className="space-y-3 overflow-x-auto">
        {loading ? (
          <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
        ) : list.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)]">
            <MessageSquare className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-3" />
            <p>Aucun avis en attente de modération</p>
          </CardContent></Card>
        ) : (
          list.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.user?.name || "Anonyme"}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-[#e67e22] fill-current" : "text-[var(--muted-foreground)]"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-sm">"{review.comment}"</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Commande #{review.order?.orderNumber || review.orderId?.slice(0, 8)}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="secondary" onClick={() => handleModerate(review.id, "APPROVED")}>
                      <Check className="w-3 h-3" /> Approuver
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleModerate(review.id, "REJECTED")}>
                      <X className="w-3 h-3" /> Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
