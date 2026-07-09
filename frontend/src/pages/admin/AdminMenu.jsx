import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { restaurants, categories, menuItems } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/ImageUpload";
import { Plus, Pencil, Trash2, Save, X, Store, UtensilsCrossed, FolderOpen, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminMenu() {
  const [restaurantList, setRestaurantList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState({ name: "", sortOrder: 1 });
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", image: "", categoryId: "" });
  const [editingItem, setEditingItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    restaurants.list().then((res) => {
      const list = res.restaurants || [];
      setRestaurantList(list);
      if (list.length > 0) loadRestaurant(list[0].id);
    }).finally(() => setLoading(false));
  }, []);

  async function loadRestaurant(id) {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await restaurants.getById(id);
      setData(res.restaurant);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  }

  async function addCategory() {
    if (!catForm.name) return toast("Le nom est requis", "error");
    try {
      await categories.create({ ...catForm, restaurantId: selectedId, sortOrder: parseInt(catForm.sortOrder) });
      setCatForm({ name: "", sortOrder: 1 });
      loadRestaurant(selectedId);
      toast("Catégorie ajoutée");
    } catch (err) { toast(err.message, "error"); }
  }

  async function deleteCategory(id) {
    if (!confirm("Supprimer cette catégorie et tous ses plats ?")) return;
    try { await categories.remove(id); loadRestaurant(selectedId); toast("Catégorie supprimée"); } catch (err) { toast(err.message, "error"); }
  }

  async function saveItem() {
    if (!itemForm.name || !itemForm.price) return toast("Nom et prix requis", "error");
    const body = { ...itemForm, price: parseInt(itemForm.price), categoryId: itemForm.categoryId || editingItem?.categoryId, image: itemForm.image || null };
    try {
      if (editingItem) {
        await menuItems.update(editingItem.id, body);
      } else {
        await menuItems.create({ ...body, restaurantId: selectedId });
      }
      setItemForm({ name: "", description: "", price: "", image: "", categoryId: "" });
      setEditingItem(null);
      loadRestaurant(selectedId);
      toast(editingItem ? "Plat modifié" : "Plat ajouté");
    } catch (err) { toast(err.message, "error"); }
  }

  function editItem(item) {
    setItemForm({ name: item.name, description: item.description || "", price: item.price.toString(), image: item.image || "", categoryId: item.categoryId });
    setEditingItem(item);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function deleteItem(id) {
    if (!confirm("Supprimer ce plat ?")) return;
    try { await menuItems.remove(id); loadRestaurant(selectedId); toast("Plat supprimé"); } catch (err) { toast(err.message, "error"); }
  }

  async function toggleItem(item) {
    try { await menuItems.toggleAvailability(item.id); loadRestaurant(selectedId); } catch (err) { toast(err.message, "error"); }
  }

  if (loading && !data) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl animate-shimmer" />)}</div>;

  const currentResto = restaurantList.find((r) => r.id === selectedId);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UtensilsCrossed className="w-6 h-6 text-[var(--primary)]" /> Menu</h1>
        {restaurantList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {restaurantList.map((r) => (
              <button key={r.id} onClick={() => loadRestaurant(r.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedId === r.id ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
                <Store className="w-4 h-4" /> {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!data && <div className="text-center py-16"><UtensilsCrossed className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" /><p>Aucun restaurant</p></div>}

      {data && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[var(--primary)] to-orange-400" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Ajouter une catégorie</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{currentResto?.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1">Nom</label>
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ex: Entrées" />
                </div>
                <div className="w-20">
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ordre</label>
                  <Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })} className="text-center" min="1" />
                </div>
                <Button onClick={addCategory}><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          {data.categories?.map((cat) => (
            <Card key={cat.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-[var(--muted)]/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[var(--primary)]" />
                  {cat.name}
                  <Badge variant="default" size="sm">{cat.menuItems?.length || 0} plat(s)</Badge>
                </CardTitle>
                <Button size="sm" variant="danger" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                {cat.menuItems?.length === 0 && <p className="p-4 text-sm text-[var(--muted-foreground)] text-center">Aucun plat dans cette catégorie</p>}
                {cat.menuItems?.map((item) => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 border-b border-[var(--border)] last:border-0 ${item.isAvailable ? "" : "opacity-60"}`}>
                    {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${item.isAvailable ? "" : "line-through"}`}>{item.name}</p>
                        {!item.isAvailable && <Badge variant="warning" size="sm">Indisponible</Badge>}
                        {item.stock !== null && item.stock <= 3 && item.isAvailable && <Badge variant="warning" size="sm">Stock: {item.stock}</Badge>}
                      </div>
                      {item.description && <p className="text-xs text-[var(--muted-foreground)] truncate">{item.description}</p>}
                      <p className="text-sm font-bold text-[var(--primary)] mt-0.5">{item.price.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleItem(item)} className={`p-2 rounded-lg transition-colors ${item.isAvailable ? "text-emerald-500" : "text-gray-300"}`}>
                        {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => editItem(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setItemForm({ name: "", description: "", price: "", image: "", categoryId: cat.id }); setEditingItem(null); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} className="w-full py-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors flex items-center justify-center gap-2 font-medium">
                  <Plus className="w-4 h-4" /> Ajouter un plat
                </button>
              </CardContent>
            </Card>
          ))}

          {(itemForm.categoryId || editingItem) && (
            <Card className="border-2 border-[var(--primary)]/30 overflow-hidden animate-fade-in">
              <div className="h-1 bg-gradient-to-r from-[var(--primary)] to-orange-400" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white shadow-md">
                    {editingItem ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold">{editingItem ? "Modifier" : "Ajouter"} un plat</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{currentResto?.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Nom *</label>
                    <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Nom du plat" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Prix (FCFA) *</label>
                    <Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="2000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Description</label>
                    <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description du plat" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Image</label>
                    <ImageUpload value={itemForm.image} onChange={(url) => setItemForm({ ...itemForm, image: url })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Catégorie</label>
                    <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                      {data.categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={saveItem} className="gap-2"><Save className="w-4 h-4" /> {editingItem ? "Modifier" : "Ajouter"}</Button>
                  <Button variant="ghost" onClick={() => { setItemForm({ name: "", description: "", price: "", image: "", categoryId: "" }); setEditingItem(null); }} className="gap-2"><X className="w-4 h-4" /> Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
