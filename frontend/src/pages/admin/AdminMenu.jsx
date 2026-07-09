import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { restaurants, categories, menuItems } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X, Image } from "lucide-react";

export default function AdminMenu() {
  const [restaurantList, setRestaurantList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState({ name: "", sortOrder: 1 });
  const [editingCat, setEditingCat] = useState(null);
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", image: "", categoryId: "" });
  const [editingItem, setEditingItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    restaurants.list().then((res) => {
      const list = res.restaurants || [];
      setRestaurantList(list);
      if (list.length > 0) return loadRestaurant(list[0].id);
    }).finally(() => setLoading(false));
  }, []);

  async function loadRestaurant(id) {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await restaurants.getById(id);
      setData(res.restaurant);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
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
    try {
      await categories.remove(id);
      loadRestaurant(selectedId);
      toast("Catégorie supprimée");
    } catch (err) { toast(err.message, "error"); }
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
  }

  async function deleteItem(id) {
    try {
      await menuItems.remove(id);
      loadRestaurant(selectedId);
      toast("Plat supprimé");
    } catch (err) { toast(err.message, "error"); }
  }

  if (loading && !data) return <div className="text-center py-12 text-[var(--muted-foreground)]">Chargement...</div>;

  const currentResto = restaurantList.find((r) => r.id === selectedId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion du Menu</h1>
        {restaurantList.length > 1 && (
          <div className="flex gap-2">
            {restaurantList.map((r) => (
              <button key={r.id} onClick={() => loadRestaurant(r.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedId === r.id ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[#e67e22]/10"}`}>{r.name}</button>
            ))}
          </div>
        )}
      </div>

      {!data && <div className="text-center py-12 text-[var(--muted-foreground)]">Aucun restaurant</div>}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Ajouter une catégorie — {currentResto?.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1">Nom</label>
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ex: Entrées" className="w-48" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ordre</label>
                  <Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })} className="w-20 text-center" min="1" />
                </div>
                <Button onClick={addCategory}><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          {data.categories?.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cat.menuItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border)]">
                      {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${item.isAvailable ? "" : "line-through text-[var(--muted-foreground)]"}`}>{item.name}</p>
                        {item.description && <p className="text-xs text-[var(--muted-foreground)] truncate">{item.description}</p>}
                        <p className="text-sm font-bold text-[#e67e22] mt-0.5">{item.price.toLocaleString()} FCFA</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => editItem(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => { setItemForm({ name: "", description: "", price: "", image: "", categoryId: cat.id }); setEditingItem(null); }} className="w-full py-2 rounded-lg border-2 border-dashed border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:border-[#e67e22] hover:text-[#e67e22] transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Ajouter un plat
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(itemForm.categoryId || editingItem) && (
            <Card className="border-[#e67e22]">
              <CardHeader><CardTitle className="text-lg">{editingItem ? "Modifier" : "Ajouter"} un plat</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">Nom *</label>
                    <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Nom du plat" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">Prix (FCFA) *</label>
                    <Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="2000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">Description</label>
                    <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description du plat" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">Image URL</label>
                    <Input value={itemForm.image} onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">Catégorie</label>
                    <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]">
                      {data.categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={saveItem}><Save className="w-4 h-4 mr-1" /> {editingItem ? "Modifier" : "Ajouter"}</Button>
                  <Button variant="ghost" onClick={() => { setItemForm({ name: "", description: "", price: "", image: "", categoryId: "" }); setEditingItem(null); }}><X className="w-4 h-4 mr-1" /> Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}