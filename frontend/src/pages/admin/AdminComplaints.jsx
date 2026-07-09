import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { complaints } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { AlertTriangle, Check, X, MessageCircle, User, Clock } from "lucide-react";

const statusMeta = {
  OPEN: { label: "Ouverte", variant: "danger" },
  DISPUTED: { label: "Contestée", variant: "warning" },
  RESOLVED: { label: "Résolue", variant: "secondary" },
  DISMISSED: { label: "Rejetée", variant: "default" },
};

export default function AdminComplaints() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [resolving, setResolving] = useState(null);
  const [resolution, setResolution] = useState("");
  const toast = useToast();

  useEffect(() => { complaints.list().then((res) => setList(res.complaints || [])).finally(() => setLoading(false)); }, []);

  const filtered = filter ? list.filter((c) => c.status === filter) : list;

  async function handleStatus(id, status) {
    try {
      const body = { status };
      if (status === "RESOLVED" && resolution) body.resolution = resolution;
      await complaints.updateStatus(id, body);
      setList((prev) => prev.map((c) => (c.id === id ? { ...c, status, resolution: body.resolution || c.resolution, resolvedBy: "Vous" } : c)));
      setResolving(null);
      setResolution("");
      toast(`Réclamation ${status === "RESOLVED" ? "résolue" : "rejetée"}`);
    } catch (err) { toast(err.message, "error"); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-500" /> Réclamations</h1>
        <Badge variant="danger" size="sm">{list.filter(c => c.status === "OPEN").length} ouvertes</Badge>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ value: "", label: "Toutes" }, ...Object.entries(statusMeta).map(([k, v]) => ({ value: k, label: v.label }))].map((r) => (
          <button key={r.value} onClick={() => setFilter(r.value)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === r.value ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>{r.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><AlertTriangle className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" /><p className="font-semibold">Aucune réclamation</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const m = statusMeta[c.status] || statusMeta.OPEN;
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${c.status === "RESOLVED" ? "bg-green-500" : "bg-red-500"}`}>
                      {c.status === "RESOLVED" ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm">{c.reason}</span>
                        <Badge variant={m.variant} size="sm">{m.label}</Badge>
                      </div>
                      {c.description && <p className="text-sm text-[var(--muted-foreground)]">{c.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {c.user?.name || "Anonyme"}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString("fr-FR")}</span>
                        <span>#{c.order?.orderNumber || c.orderId?.slice(0, 8)}</span>
                      </div>
                      {c.resolution && (
                        <div className="mt-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">Résolution</p>
                          <p className="text-sm text-green-600 dark:text-green-300">{c.resolution}</p>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {resolving === c.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <div>
                            <Label className="text-xs">Solution</Label>
                            <Input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Votre solution..." />
                          </div>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="secondary" onClick={() => handleStatus(c.id, "RESOLVED")} className="gap-1"><Check className="w-3 h-3" /> Résoudre</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatus(c.id, "DISMISSED")} className="gap-1"><X className="w-3 h-3" /> Rejeter</Button>
                            <Button size="sm" variant="ghost" onClick={() => setResolving(null)}>Annuler</Button>
                          </div>
                        </div>
                      ) : (c.status === "OPEN" || c.status === "DISPUTED") ? (
                        <Button size="sm" onClick={() => setResolving(c.id)} className="gap-1"><MessageCircle className="w-3.5 h-3.5" /> Traiter</Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
