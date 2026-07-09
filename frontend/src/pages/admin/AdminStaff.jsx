import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { auth, restaurants } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { UserPlus, Bike, UserCog, Shield, Store } from "lucide-react";

export default function AdminStaff() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "LIVREUR", restaurantId: "" });
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const toast = useToast();

  useEffect(() => {
    restaurants.list().then((res) => setAllRestaurants(res.restaurants || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await auth.registerStaff(form);
      toast(`Compte ${form.role} créé`);
      setForm({ name: "", phone: "", email: "", password: "", role: "LIVREUR", restaurantId: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Gestion du personnel</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Créer un compte staff</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rôle</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button type="button" onClick={() => setForm({ ...form, role: "LIVREUR" })} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${form.role === "LIVREUR" ? "border-[#e67e22] bg-orange-50 text-[#e67e22]" : "border-[var(--border)]"}`}>
                  <Bike className="w-4 h-4" /> Livreur
                </button>
                <button type="button" onClick={() => setForm({ ...form, role: "GERANT" })} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${form.role === "GERANT" ? "border-[#e67e22] bg-orange-50 text-[#e67e22]" : "border-[var(--border)]"}`}>
                  <UserCog className="w-4 h-4" /> Gérant
                </button>
                {user?.role === "ADMIN" && (
                  <button type="button" onClick={() => setForm({ ...form, role: "ADMIN" })} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${form.role === "ADMIN" ? "border-[#e67e22] bg-orange-50 text-[#e67e22]" : "border-[var(--border)]"}`}>
                    <Shield className="w-4 h-4" /> Admin
                  </button>
                )}
              </div>
            </div>

            {form.role === "GERANT" && (
              <div>
                <Label>Restaurant</Label>
                <select value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })} className="w-full mt-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]" required>
                  <option value="">Sélectionner un restaurant</option>
                  {allRestaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" required />
            </div>
            <div>
              <Label>Email (optionnel)</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required minLength={6} />
            </div>

            {message && <p className={`text-sm ${message.includes("succès") ? "text-green-600" : "text-red-500"}`}>{message}</p>}

            <Button type="submit" disabled={saving}>{saving ? "Création..." : "Créer le compte"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
