import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { complaints } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AlertTriangle, Check, X, Search } from "lucide-react";

const statusColors = {
  OPEN: "bg-red-100 text-red-800",
  DISPUTED: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISMISSED: "bg-[var(--muted)] text-[var(--foreground)]",
};

export default function AdminComplaints() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [resolving, setResolving] = useState(null);
  const toast = useToast();
  const [resolution, setResolution] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await complaints.list();
      setList(res.complaints || []);
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des réclamations</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>Toutes</button>
        {["OPEN", "DISPUTED", "RESOLVED", "DISMISSED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)]">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>Aucune réclamation</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="font-medium text-sm">{c.reason}</p>
                    {c.description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{c.description}</p>}
                    <div className="flex gap-4 mt-1 text-xs text-[var(--muted-foreground)]">
                      <span>Par {c.user?.name || "Anonyme"}</span>
                      <span>Commande #{c.order?.orderNumber || c.orderId?.slice(0, 8)}</span>
                    </div>
                    {c.resolution && <p className="text-sm text-[var(--muted-foreground)] mt-2 bg-green-50 p-2 rounded">Résolution : {c.resolution}</p>}
                  </div>

                  <div className="ml-4 shrink-0">
                    {resolving === c.id ? (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Résolution</Label>
                          <Input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Solution..." className="text-sm w-48" />
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => handleStatus(c.id, "RESOLVED")}>
                            <Check className="w-3 h-3" /> Résoudre
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatus(c.id, "DISMISSED")}>
                            <X className="w-3 h-3" /> Rejeter
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setResolving(null)} className="text-[var(--muted-foreground)]">Annuler</Button>
                        </div>
                      </div>
                    ) : (c.status === "OPEN" || c.status === "DISPUTED") && (
                      <Button size="sm" onClick={() => setResolving(c.id)}>Traiter</Button>
                    )}
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
