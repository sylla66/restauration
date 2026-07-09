import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orders, auth } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { User, Package, Clock, CheckCircle, XCircle, Truck, Edit3, Eye, EyeOff, Save } from "lucide-react";

const statusMeta = {
  PENDING: { label: "En attente", variant: "warning" },
  CONFIRMED: { label: "Confirmée", variant: "info" },
  PREPARING: { label: "En préparation", variant: "warning" },
  READY: { label: "Prête", variant: "info" },
  DELIVERED: { label: "Livrée", variant: "secondary" },
  CANCELLED: { label: "Annulée", variant: "danger" },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("infos");

  if (!user) { navigate("/login"); return null; }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {user.role === "ADMIN" ? "Administrateur" : user.role === "GERANT" ? "Gérant" : user.role === "LIVREUR" ? "Livreur" : "Client"}
            {user.managedRestaurant?.name && ` — ${user.managedRestaurant.name}`}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--muted)] w-fit">
        {["infos", "orders"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            {t === "infos" ? "Informations" : "Commandes"}
          </button>
        ))}
      </div>

      {tab === "infos" ? <ProfileInfo user={user} /> : <OrderHistory />}
    </div>
  );
}

function ProfileInfo({ user }) {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { updateProfile } = useAuth();

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (form.email === "") body.email = null;
      if (passwords.newPassword) {
        body.currentPassword = passwords.currentPassword;
        body.newPassword = passwords.newPassword;
      }
      await updateProfile(body);
      toast("Profil mis à jour");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]" />
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" required />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="email@exemple.com" />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4 text-[var(--primary)]" /> Changer de mot de passe</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Mot de passe actuel</Label>
                <Input type={showPw ? "text" : "password"} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              </div>
              <div>
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="gap-2"><Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Enregistrer"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function OrderHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    orders.list({}).then((res) => setList(res.orders || [])).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)}</div>
  );

  if (list.length === 0) return (
    <Card><CardContent className="p-12 text-center">
      <Package className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-3" />
      <p className="font-semibold">Aucune commande</p>
      <p className="text-sm text-[var(--muted-foreground)]">Passez votre première commande !</p>
    </CardContent></Card>
  );

  return (
    <div className="space-y-3">
      {list.map((order) => {
        const m = statusMeta[order.status] || statusMeta.PENDING;
        return (
          <Card key={order.id} hover className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${order.status === "DELIVERED" ? "bg-green-500" : order.status === "CANCELLED" ? "bg-red-500" : "bg-[var(--primary)]"}`}>
                  {order.status === "DELIVERED" ? <CheckCircle className="w-6 h-6" /> : order.status === "CANCELLED" ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <Badge variant={m.variant} size="sm">{m.label}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    {order.restaurant?.name && ` • ${order.restaurant.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[var(--primary)]">{order.total.toLocaleString()} FCFA</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{order.channel === "REMOTE" ? (order.subType === "DELIVERY" ? "Livraison" : "Emporter") : "Sur place"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
