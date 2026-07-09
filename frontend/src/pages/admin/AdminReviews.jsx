import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { reviews } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, MessageSquare, User, Clock } from "lucide-react";

export default function AdminReviews() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    reviews.listPending().then((res) => setList(res.reviews || [])).finally(() => setLoading(false));
  }, []);

  async function handleModerate(id, status) {
    try {
      await reviews.moderate(id, status);
      setList((prev) => prev.filter((r) => r.id !== id));
      toast(`Avis ${status === "APPROVED" ? "approuvé" : "rejeté"}`);
    } catch (err) { toast(err.message, "error"); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6 text-[var(--primary)]" /> Avis</h1>
        <Badge variant="warning" size="sm">{list.length} en attente</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl animate-shimmer" />)}</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="font-semibold">Aucun avis en attente</p>
          <p className="text-sm text-[var(--muted-foreground)]">Tous les avis sont modérés</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {review.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm">{review.user?.name || "Anonyme"}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-[var(--muted-foreground)]"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[var(--foreground)] bg-[var(--muted)] rounded-xl p-3 mt-1 italic">"{review.comment}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString("fr-FR")}</span>
                      <span>#{review.order?.orderNumber || review.orderId?.slice(0, 8)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => handleModerate(review.id, "APPROVED")} className="gap-1">
                      <Check className="w-3.5 h-3.5" /> Approuver
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleModerate(review.id, "REJECTED")} className="gap-1">
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </Button>
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
