import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { auth, restaurants } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { UserPlus, Bike, UserCog, Shield, Store, Eye, EyeOff } from "lucide-react";

const roleOptions = [
  { value: "LIVREUR", label: "Livreur", icon: Bike, color: "from-orange-500 to-amber-600", desc: "Accès livraisons" },
  { value: "GERANT", label: "Gérant", icon: UserCog, color: "from-blue-500 to-cyan-600", desc: "Gère un restaurant" },
  { value: "ADMIN", label: "Administrateur", icon: Shield, color: "from-purple-500 to-pink-600", desc: "Accès complet" },
];

export default function AdminStaff() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "LIVREUR", restaurantId: "" });
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const toast = useToast();

  useEffect(() => {
    restaurants.list().then((res) => setAllRestaurants(res.restaurants || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) return toast("Champs requis", "error");
    if (form.password.length < 6) return toast("Mot de passe : 6 caractères min", "error");
    setSaving(true);
    try {
      await auth.registerStaff(form);
      toast(`Compte ${form.role} créé avec succès`);
      setForm({ name: "", phone: "", email: "", password: "", role: "LIVREUR", restaurantId: "" });
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserPlus className="w-6 h-6 text-[var(--primary)]" /> Personnel</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]" />
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Rôle</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                {roleOptions.filter((r) => r.value !== "ADMIN" || user?.role === "ADMIN").map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, role: opt.value })} className={`relative overflow-hidden p-4 rounded-xl border-2 text-left transition-all ${form.role === opt.value ? "border-[var(--primary)] bg-[var(--primary-light)]" : "border-[var(--border)] hover:border-[var(--primary)]/30"}`}>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center text-white mb-2`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{opt.desc}</p>
                    {form.role === opt.value && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[var(--primary)]" />}
                  </button>
                ))}
              </div>
            </div>

            {form.role === "GERANT" && (
              <div>
                <Label>Restaurant</Label>
                <select value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" required>
                  <option value="">Sélectionner un restaurant</option>
                  {allRestaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom complet" required />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" placeholder="77 000 00 00" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email (optionnel)</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="email@exemple.com" />
              </div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type={showPw ? "text" : "password"} placeholder="6 caractères min" required minLength={6} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full gap-2">
              <UserPlus className="w-4 h-4" /> {saving ? "Création..." : "Créer le compte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
