import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { restaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Store, Trash2, MapPin, Phone, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminRestaurants() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await restaurants.list({});
      setList(res.restaurants || []);
    } finally { setLoading(false); }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      await restaurants.seed();
      await load();
      toast("Restaurants de démo créés !");
    } catch (err) { toast(err.message, "error"); } finally { setSeeding(false); }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    try {
      await restaurants.remove(id);
      toast("Restaurant supprimé");
      await load();
    } catch (err) { toast(err.message, "error"); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Store className="w-6 h-6 text-[var(--primary)]" /> Restaurants</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{list.length} restaurant{list.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding} className="gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {seeding ? "Création..." : "Générer"}
          </Button>
          <Link to="/admin/restaurants/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl animate-shimmer" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <Store className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="font-semibold text-lg mb-2">Aucun restaurant</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">Créez votre premier restaurant ou générez des données de démo</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={handleSeed}>Générer un restaurant de démo</Button>
            <Link to="/admin/restaurants/new"><Button><Plus className="w-4 h-4" /> Ajouter</Button></Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((r, i) => (
            <Card key={r.id} hover className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{r.name}</h3>
                      {r.isActive === false && <Badge variant="danger" size="sm">Inactif</Badge>}
                    </div>
                    {r.address && <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {r.address}</p>}
                    {r.phone && <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><Phone className="w-3 h-3" /> {r.phone}</p>}
                    {r.deliveryZones?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.deliveryZones.slice(0, 3).map((z) => (
                          <span key={z} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">{z}</span>
                        ))}
                        {r.deliveryZones.length > 3 && <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">+{r.deliveryZones.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link to={`/admin/restaurants/${r.id}`}>
                      <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id, r.name)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
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
