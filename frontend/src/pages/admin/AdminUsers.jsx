import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { users } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Search } from "lucide-react";

const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800",
  GERANT: "bg-blue-100 text-blue-800",
  LIVREUR: "bg-orange-100 text-orange-800",
  CLIENT: "bg-gray-100 text-gray-800",
};

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.role = filter;
      const res = await users.list(params);
      setList(res.users || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id, name) {
    if (!confirm(`${list.find(u => u.id === id)?.isActive ? "Désactiver" : "Activer"} le compte de ${name} ?`)) return;
    try {
      await users.toggleActive(id);
      setList((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
      toast(`Utilisateur ${!list.find(u => u.id === id)?.isActive ? "activé" : "désactivé"}`);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5" /> Utilisateurs</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#e67e22] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
        {["ADMIN", "GERANT", "LIVREUR", "CLIENT"].map((r) => (
          <button key={r} onClick={() => setFilter(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === r ? "bg-[#e67e22] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{r}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Chargement...</p>
      ) : list.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>Aucun utilisateur</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {list.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${u.isActive ? "bg-[#e67e22]" : "bg-gray-300"}`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[u.role]}`}>{u.role}</span>
                      {!u.isActive && <span className="text-xs text-red-500 font-medium">Inactif</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {u.phone}
                      {u.email && <span className="ml-3">{u.email}</span>}
                    </div>
                    <p className="text-xs text-gray-400">Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <Button variant={u.isActive ? "outline" : "default"} size="sm" onClick={() => handleToggle(u.id, u.name)}>
                  {u.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {u.isActive ? " Désactiver" : " Activer"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
