import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { restaurants, categories, menuItems } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import ImageUpload from "@/components/ui/ImageUpload";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight } from "lucide-react";

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
        setForm({
          name: res.restaurant.name || "",
          address: res.restaurant.address || "",
          phone: res.restaurant.phone || "",
          email: res.restaurant.email || "",
          logo: res.restaurant.logo || "",
          deliveryRadius: res.restaurant.deliveryRadius?.toString() || "",
        });
      });
    }
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        deliveryRadius: form.deliveryRadius ? parseFloat(form.deliveryRadius) : undefined,
        email: form.email || undefined,
      };
      if (isNew) {
        const res = await restaurants.create(body);
        toast("Restaurant créé");
        navigate(`/admin/restaurants/${res.restaurant.id}`, { replace: true });
      } else {
        await restaurants.update(id, body);
        toast("Restaurant mis à jour");
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCatSave(e) {
    e.preventDefault();
    try {
      const body = { name: catForm.name, restaurantId: id, sortOrder: catForm.sortOrder ? parseInt(catForm.sortOrder) : undefined };
      if (editingCatId) {
        await categories.update(editingCatId, body);
      } else {
        await categories.create(body);
      }
      setCatForm({ name: "", sortOrder: "" });
      setShowCatForm(false);
      setEditingCatId(null);
      const res = await restaurants.getById(id);
      setData(res.restaurant);
      toast(editingCatId ? "Catégorie modifiée" : "Catégorie ajoutée");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleCatDelete(catId) {
    if (!confirm("Supprimer cette catégorie et tous ses plats ?")) return;
    try {
      await categories.remove(catId);
      const res = await restaurants.getById(id);
      setData(res.restaurant);
      toast("Catégorie supprimée");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  function editCat(cat) {
    setCatForm({ name: cat.name, sortOrder: cat.sortOrder?.toString() || "" });
    setEditingCatId(cat.id);
    setShowCatForm(true);
  }

  async function handleItemSave(e) {
    e.preventDefault();
    try {
      const body = { ...itemForm, price: parseFloat(itemForm.price), stock: itemForm.stock ? parseInt(itemForm.stock) : undefined, restaurantId: id };
      if (editingItemId) {
        await menuItems.update(editingItemId, body);
      } else {
        await menuItems.create(body);
      }
      setItemForm({ name: "", description: "", price: "", categoryId: "", stock: "", image: "" });
      setShowItemForm(false);
      setEditingItemId(null);
      const res = await restaurants.getById(id);
      setData(res.restaurant);
      toast(editingItemId ? "Plat modifié" : "Plat ajouté");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleItemDelete(itemId) {
    if (!confirm("Supprimer ce plat ?")) return;
    try {
      await menuItems.remove(itemId);
      const res = await restaurants.getById(id);
      setData(res.restaurant);
      toast("Plat supprimé");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleToggle(itemId) {
    try {
      await menuItems.toggleAvailability(itemId);
      const res = await restaurants.getById(id);
      setData(res.restaurant);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  function editItem(item) {
    setItemForm({ name: item.name, description: item.description || "", price: item.price.toString(), categoryId: item.categoryId, stock: item.stock?.toString() || "", image: item.image || "" });
    setEditingItemId(item.id);
    setShowItemForm(true);
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/restaurants" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[#e67e22] mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <Card className="mb-6">
        <CardHeader><CardTitle>{isNew ? "Nouveau restaurant" : "Modifier le restaurant"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
            </div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
            <div><Label>Logo</Label><ImageUpload value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Rayon livraison (km)</Label><Input type="number" value={form.deliveryRadius} onChange={(e) => setForm({ ...form, deliveryRadius: e.target.value })} /></div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </form>
        </CardContent>
      </Card>

      {!isNew && data && (
        <>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catégories</CardTitle>
              <Button size="sm" onClick={() => { setShowCatForm(!showCatForm); setEditingCatId(null); setCatForm({ name: "", sortOrder: "" }); }}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {showCatForm && (
                <form onSubmit={handleCatSave} className="flex gap-3 mb-4 p-3 bg-[var(--muted)] rounded-lg">
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nom" required />
                  <Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })} placeholder="Ordre" className="w-20" />
                  <Button size="sm" type="submit">{editingCatId ? "Modifier" : "Ajouter"}</Button>
                  <button type="button" onClick={() => { setShowCatForm(false); setEditingCatId(null); }} className="text-[var(--muted-foreground)] hover:text-gray-600"><X className="w-4 h-4" /></button>
                </form>
              )}
              {data.categories?.length === 0 ? (
                <p className="text-[var(--muted-foreground)] text-sm">Aucune catégorie</p>
              ) : (
                <div className="space-y-1">
                  {data.categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div>
                        <span className="font-medium text-sm">{cat.name}</span>
                        {cat.sortOrder > 0 && <span className="text-xs text-[var(--muted-foreground)] ml-2">({cat.sortOrder})</span>}
                        <span className="text-xs text-[var(--muted-foreground)] ml-2">{cat.menuItems?.length || 0} plats</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editCat(cat)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCatDelete(cat.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plats</CardTitle>
              <Button size="sm" onClick={() => { setShowItemForm(!showItemForm); setEditingItemId(null);     setItemForm({ name: "", description: "", price: "", categoryId: "", stock: "", image: "" }); }}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {showItemForm && (
                <form onSubmit={handleItemSave} className="space-y-3 mb-4 p-3 bg-[var(--muted)] rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Nom</Label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required /></div>
                    <div><Label>Prix (FCFA)</Label><Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required /></div>
                  </div>
                  <div><Label>Description</Label><Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} /></div>
                  <div><Label>Image</Label><ImageUpload value={itemForm.image} onChange={(url) => setItemForm({ ...itemForm, image: url })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Catégorie</Label>
                      <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                        <option value="">Sélectionner...</option>
                        {data.categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div><Label>Stock</Label><Input type="number" value={itemForm.stock} onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="submit">{editingItemId ? "Modifier" : "Ajouter"}</Button>
                    <button type="button" onClick={() => { setShowItemForm(false); setEditingItemId(null); }} className="text-[var(--muted-foreground)] hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                </form>
              )}
              {data.categories?.length === 0 ? (
                <p className="text-[var(--muted-foreground)] text-sm">Ajoutez d'abord une catégorie</p>
              ) : (
                <div className="space-y-2">
                  {data.categories?.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-1">{cat.name}</p>
                      {cat.menuItems?.length === 0 && <p className="text-xs text-[var(--muted-foreground)] ml-2 mb-2">Aucun plat</p>}
                      {cat.menuItems?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-[var(--muted)] rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleToggle(item.id)} className={item.isAvailable ? "text-[#2ecc71]" : "text-gray-300"}>
                              {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />}
                            <div>
                              <span className={item.isAvailable ? "" : "text-[var(--muted-foreground)] line-through"}>{item.name}</span>
                              {item.description && <span className="text-xs text-[var(--muted-foreground)] ml-2">{item.description}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-[#e67e22]">{item.price} FCFA</span>
                            <Button variant="ghost" size="sm" onClick={() => editItem(item)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleItemDelete(item.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
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
