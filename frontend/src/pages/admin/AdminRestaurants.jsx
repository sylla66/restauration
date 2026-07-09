import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { restaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Store, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminRestaurants() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [mineOnly, setMineOnly] = useState(true);
  const toast = useToast();

  useEffect(() => { load(); }, [mineOnly]);

  async function load() {
    setLoading(true);
    try {
      const res = await restaurants.list(mineOnly ? { mine: "true" } : {});
      setList(res.restaurants || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      await restaurants.seed();
      await load();
      toast("Restaurant de démo créé !");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <div className="flex bg-[var(--muted)] rounded-lg p-0.5">
            <button onClick={() => setMineOnly(true)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mineOnly ? "bg-[#e67e22] text-white" : "text-[var(--muted-foreground)]"}`}>Mes restaurants</button>
            <button onClick={() => setMineOnly(false)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${!mineOnly ? "bg-[#e67e22] text-white" : "text-[var(--muted-foreground)]"}`}>Tous</button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {seeding ? "Création..." : "Seed"}
          </Button>
          <Link to="/admin/restaurants/new"><Button><Plus className="w-4 h-4" /> Ajouter</Button></Link>
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">Chargement...</p>
      ) : list.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-[var(--muted-foreground)] space-y-4">
          <Store className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
          <p>Aucun restaurant</p>
          <Button variant="outline" onClick={handleSeed}>Générer un restaurant de démo</Button>
        </CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{r.address}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{r.phone}</p>
                </div>
                <div className="flex gap-1">
                  <Link to={`/admin/restaurants/${r.id}`}>
                    <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={async () => { if (!confirm("Supprimer ce restaurant ?")) return; try { await restaurants.remove(r.id); toast("Restaurant supprimé"); await load(); } catch (err) { toast(err.message, "error"); } }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
