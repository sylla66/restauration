import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orders } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { User, Package, Clock } from "lucide-react";

const statusBadge = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("infos");

  if (!user) { navigate("/login"); return null; }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button onClick={() => setTab("infos")} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === "infos" ? "border-[#e67e22] text-[#e67e22]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Informations</button>
        <button onClick={() => setTab("orders")} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === "orders" ? "border-[#e67e22] text-[#e67e22]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Commandes</button>
      </div>

      {tab === "infos" ? <ProfileInfo user={user} /> : <OrderHistory />}
    </div>
  );
}

function ProfileInfo({ user }) {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const toast = useToast();
  const { updateProfile } = useAuth();

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
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
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Informations personnelles</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" required />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="email@exemple.com" />
          </div>

          <hr className="border-gray-200" />
          <p className="text-sm text-gray-500">Changer de mot de passe (optionnel)</p>

          <div>
            <Label>Mot de passe actuel</Label>
            <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </div>
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>

          {message && <p className={`text-sm ${message === "Profil mis à jour" ? "text-green-600" : "text-red-500"}`}>{message}</p>}

          <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
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

  if (loading) return <p className="text-gray-500 text-center py-8">Chargement...</p>;

  if (list.length === 0) return (
    <Card><CardContent className="p-8 text-center text-gray-500">Aucune commande pour le moment</CardContent></Card>
  );

  return (
    <div className="space-y-3">
      {list.map((order) => (
        <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/orders/${order.id}`)}>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[order.status] || "bg-gray-100"}`}>{order.status}</span>
              <span className="font-bold text-[#e67e22] text-sm">{order.total} FCFA</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
