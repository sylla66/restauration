import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { users } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Search, Shield, ShieldCheck, Clock } from "lucide-react";

const roleMeta = {
  ADMIN: { label: "Administrateur", variant: "danger", icon: ShieldCheck },
  GERANT: { label: "Gérant", variant: "info", icon: Shield },
  LIVREUR: { label: "Livreur", variant: "warning", icon: UserCheck },
  CLIENT: { label: "Client", variant: "default", icon: Users },
};

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.role = filter;
      const res = await users.list(params);
      setList(res.users || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleToggle(id, name) {
    const u = list.find(u => u.id === id);
    if (!confirm(`${u?.isActive ? "Désactiver" : "Activer"} le compte de ${name} ?`)) return;
    try {
      await users.toggleActive(id);
      setList((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
      toast(`Compte ${!list.find(u => u.id === id)?.isActive ? "activé" : "désactivé"}`);
    } catch (err) { toast(err.message, "error"); }
  }

  const filtered = search ? list.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)) : list;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-[var(--primary)]" /> Utilisateurs</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ value: "", label: "Tous" }, { value: "ADMIN", label: "Admin" }, { value: "GERANT", label: "Gérant" }, { value: "LIVREUR", label: "Livreur" }, { value: "CLIENT", label: "Client" }].map((r) => (
          <button key={r.value} onClick={() => setFilter(r.value)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === r.value ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>{r.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Users className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" /><p className="font-semibold">Aucun utilisateur</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const role = roleMeta[u.role] || roleMeta.CLIENT;
            const RoleIcon = role.icon;
            return (
              <Card key={u.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${u.isActive ? "bg-gradient-primary" : "bg-gray-300 dark:bg-gray-700"}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{u.name}</span>
                        <Badge variant={role.variant} size="sm"><RoleIcon className="w-3 h-3" /> {role.label}</Badge>
                        {!u.isActive && <Badge variant="danger" size="sm">Inactif</Badge>}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {u.phone}{u.email ? ` • ${u.email}` : ""}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Button variant={u.isActive ? "outline" : "default"} size="sm" onClick={() => handleToggle(u.id, u.name)} className="shrink-0 gap-1.5">
                      {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {u.isActive ? "Désactiver" : "Activer"}
                    </Button>
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
