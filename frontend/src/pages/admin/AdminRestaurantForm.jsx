import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { restaurants, categories, menuItems } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import ImageUpload from "@/components/ui/ImageUpload";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Store, FolderOpen, UtensilsCrossed, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminRestaurantForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", deliveryRadius: "", logo: "" });
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const toast = useToast();

  const [catForm, setCatForm] = useState({ name: "", sortOrder: "" });
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", categoryId: "", stock: "", image: "" });
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    if (!isNew) {
      restaurants.getById(id).then((res) => {
        setData(res.restaurant);
        const r = res.restaurant;
        setForm({ name: r.name || "", address: r.address || "", phone: r.phone || "", email: r.email || "", logo: r.logo || "", deliveryRadius: r.deliveryRadius?.toString() || "" });
      });
    }
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, deliveryRadius: form.deliveryRadius ? parseFloat(form.deliveryRadius) : undefined, email: form.email || undefined };
      if (isNew) {
        const res = await restaurants.create(body);
        toast("Restaurant créé !");
        navigate(`/admin/restaurants/${res.restaurant.id}`, { replace: true });
      } else {
        await restaurants.update(id, body);
        toast("Restaurant mis à jour !");
      }
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleCatSave(e) {
    e.preventDefault();
    try {
      const body = { name: catForm.name, restaurantId: id, sortOrder: catForm.sortOrder ? parseInt(catForm.sortOrder) : undefined };
      if (editingCatId) await categories.update(editingCatId, body);
      else await categories.create(body);
      setCatForm({ name: "", sortOrder: "" }); setShowCatForm(false); setEditingCatId(null);
      const res = await restaurants.getById(id); setData(res.restaurant);
      toast(editingCatId ? "Catégorie modifiée" : "Catégorie ajoutée");
    } catch (err) { toast(err.message, "error"); }
  }

  async function handleCatDelete(catId) {
    if (!confirm("Supprimer cette catégorie et tous ses plats ?")) return;
    try { await categories.remove(catId); const res = await restaurants.getById(id); setData(res.restaurant); toast("Catégorie supprimée"); } catch (err) { toast(err.message, "error"); }
  }

  function editCat(cat) { setCatForm({ name: cat.name, sortOrder: cat.sortOrder?.toString() || "" }); setEditingCatId(cat.id); setShowCatForm(true); }

  async function handleItemSave(e) {
    e.preventDefault();
    try {
      const body = { ...itemForm, price: parseFloat(itemForm.price), stock: itemForm.stock ? parseInt(itemForm.stock) : undefined, restaurantId: id };
      if (editingItemId) await menuItems.update(editingItemId, body);
      else await menuItems.create(body);
      setItemForm({ name: "", description: "", price: "", categoryId: "", stock: "", image: "" }); setShowItemForm(false); setEditingItemId(null);
      const res = await restaurants.getById(id); setData(res.restaurant);
      toast(editingItemId ? "Plat modifié" : "Plat ajouté");
    } catch (err) { toast(err.message, "error"); }
  }

  async function handleItemDelete(itemId) {
    if (!confirm("Supprimer ce plat ?")) return;
    try { await menuItems.remove(itemId); const res = await restaurants.getById(id); setData(res.restaurant); toast("Plat supprimé"); } catch (err) { toast(err.message, "error"); }
  }

  async function handleToggle(itemId) {
    try { await menuItems.toggleAvailability(itemId); const res = await restaurants.getById(id); setData(res.restaurant); } catch (err) { toast(err.message, "error"); }
  }

  function editItem(item) {
    setItemForm({ name: item.name, description: item.description || "", price: item.price.toString(), categoryId: item.categoryId, stock: item.stock?.toString() || "", image: item.image || "" });
    setEditingItemId(item.id); setShowItemForm(true);
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour aux restaurants
      </Link>

      <Card className="overflow-hidden mb-6">
        <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]" />
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{isNew ? "Nouveau restaurant" : "Modifier le restaurant"}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{isNew ? "Créez un nouveau restaurant" : "Modifiez les informations du restaurant"}</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du restaurant" required /></div>
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 77 123 45 67" required /></div>
            </div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adresse complète" required /></div>
            <div><Label>Logo</Label><ImageUpload value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@exemple.com" /></div>
              <div><Label>Rayon livraison (km)</Label><Input type="number" value={form.deliveryRadius} onChange={(e) => setForm({ ...form, deliveryRadius: e.target.value })} placeholder="10" /></div>
            </div>
            <Button type="submit" disabled={saving} className="gap-2"><Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </form>
        </CardContent>
      </Card>

      {!isNew && data && (
        <>
          <Card className="overflow-hidden mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-[var(--primary)]" /> Catégories</CardTitle>
              <Button size="sm" onClick={() => { setShowCatForm(!showCatForm); setEditingCatId(null); setCatForm({ name: "", sortOrder: "" }); }} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
            </CardHeader>
            <CardContent>
              {showCatForm && (
                <form onSubmit={handleCatSave} className="flex gap-3 mb-4 p-4 rounded-xl bg-[var(--muted)] items-end">
                  <div className="flex-1"><Label className="text-xs">Nom</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ex: Entrées" required /></div>
                  <div className="w-24"><Label className="text-xs">Ordre</Label><Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })} placeholder="1" /></div>
                  <Button size="sm" type="submit">{editingCatId ? "Modifier" : "Ajouter"}</Button>
                  <button type="button" onClick={() => { setShowCatForm(false); setEditingCatId(null); }} className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--card)]"><X className="w-4 h-4" /></button>
                </form>
              )}
              {data.categories?.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Aucune catégorie</p>
              ) : (
                <div className="space-y-1">
                  {data.categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-[var(--primary)]/60" />
                        <div>
                          <span className="font-semibold text-sm">{cat.name}</span>
                          <Badge variant="default" size="sm" className="ml-2">{cat.menuItems?.length || 0} plat(s)</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editCat(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCatDelete(cat.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-[var(--primary)]" /> Plats</CardTitle>
              <Button size="sm" onClick={() => { setShowItemForm(!showItemForm); setEditingItemId(null); setItemForm({ name: "", description: "", price: "", categoryId: "", stock: "", image: "" }); }} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
            </CardHeader>
            <CardContent>
              {showItemForm && (
                <form onSubmit={handleItemSave} className="space-y-3 mb-4 p-4 rounded-xl bg-[var(--muted)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Nom</Label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Nom du plat" required /></div>
                    <div><Label className="text-xs">Prix (FCFA)</Label><Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="2000" required /></div>
                  </div>
                  <div><Label className="text-xs">Description</Label><Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description..." /></div>
                  <div><Label className="text-xs">Image</Label><ImageUpload value={itemForm.image} onChange={(url) => setItemForm({ ...itemForm, image: url })} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Catégorie</Label>
                      <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" required>
                        <option value="">Sélectionner...</option>
                        {data.categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div><Label className="text-xs">Stock</Label><Input type="number" value={itemForm.stock} onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })} placeholder="Optionnel" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="submit" className="gap-1"><Save className="w-3.5 h-3.5" /> {editingItemId ? "Modifier" : "Ajouter"}</Button>
                    <button type="button" onClick={() => { setShowItemForm(false); setEditingItemId(null); }} className="px-3 py-1.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--card)]">Annuler</button>
                  </div>
                </form>
              )}
              {data.categories?.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Ajoutez d'abord une catégorie</p>
              ) : (
                <div className="space-y-4">
                  {data.categories?.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">{cat.name}</p>
                      {cat.menuItems?.length === 0 && <p className="text-xs text-[var(--muted-foreground)] mb-2">Aucun plat</p>}
                      {cat.menuItems?.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl hover:bg-[var(--muted)] transition-colors ${!item.isAvailable ? "opacity-60" : ""}`}>
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleToggle(item.id)} className={`p-1.5 rounded-lg transition-colors ${item.isAvailable ? "text-emerald-500" : "text-gray-300"}`}>
                              {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            {item.image && <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                            <div>
                              <span className={`font-medium text-sm ${item.isAvailable ? "" : "line-through"}`}>{item.name}</span>
                              {!item.isAvailable && <Badge variant="warning" size="sm" className="ml-2">Indisponible</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--primary)]">{item.price.toLocaleString()} FCFA</span>
                            {item.stock !== null && <Badge variant="default" size="sm">Stock: {item.stock}</Badge>}
                            <Button variant="ghost" size="sm" onClick={() => editItem(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleItemDelete(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
