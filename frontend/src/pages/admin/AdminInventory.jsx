import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { restaurants, menuItems, deliveries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Save, ToggleLeft, ToggleRight, AlertTriangle, Store, MapPin, Phone, Map, Truck, Bike, Package } from "lucide-react";

export default function AdminInventory() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockValues, setStockValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deliveryList, setDeliveryList] = useState([]);
  const toast = useToast();

  useEffect(() => { loadMyRestaurants(); }, []);

  async function loadMyRestaurants() {
    setLoading(true);
    try {
      const res = await restaurants.list({ mine: "true" });
      const list = res.restaurants || [];
      setMyRestaurants(list);
      if (list.length > 0) loadRestaurant(list[0].id);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  }

  async function loadRestaurant(id) {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await restaurants.getById(id);
      setData(res.restaurant);
      const stocks = {};
      res.restaurant.categories?.forEach((cat) =>
        cat.menuItems?.forEach((item) => { stocks[item.id] = item.stock ?? ""; })
      );
      setStockValues(stocks);
      const delRes = await deliveries.list({ restaurantId: id });
      setDeliveryList((delRes.deliveries || []).filter((d) => d.status !== "delivered"));
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  }

  async function handleStockSave(itemId) {
    const val = stockValues[itemId];
    const stock = val === "" || val === null ? null : parseInt(val, 10);
    if (stock !== null && isNaN(stock)) return toast("Stock invalide", "error");
    setSaving(true);
    try {
      await menuItems.update(itemId, { stock });
      toast("Stock mis à jour");
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleToggle(itemId) {
    await menuItems.toggleAvailability(itemId);
    loadRestaurant(data.id);
  }

  if (loading && !data) return (
    <div className="space-y-4">
      <div className="h-10 w-48 rounded-xl animate-shimmer" />
      <div className="grid lg:grid-cols-2 gap-4">{[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl animate-shimmer" />)}</div>
      <div className="h-96 rounded-2xl animate-shimmer" />
    </div>
  );
  if (myRestaurants.length === 0) return (
    <div className="text-center py-16">
      <Store className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
      <p className="font-semibold">Aucun restaurant</p>
    </div>
  );

  const allItems = data?.categories?.flatMap((cat) =>
    (cat.menuItems || []).map((item) => ({ ...item, categoryName: cat.name }))
  ) || [];

  const filtered = search
    ? allItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.categoryName?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const lowStockCount = allItems.filter((i) => i.stock !== null && i.stock !== undefined && i.stock <= 3).length;
  const unavailableCount = allItems.filter((i) => !i.isAvailable).length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-[var(--primary)]" /> Inventaire</h1>
          <div className="flex items-center gap-2 mt-1">
            {lowStockCount > 0 && <Badge variant="warning" size="sm"><AlertTriangle className="w-3 h-3" /> {lowStockCount} stock bas</Badge>}
            {unavailableCount > 0 && <Badge variant="danger" size="sm">{unavailableCount} indisponible{unavailableCount > 1 ? "s" : ""}</Badge>}
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 w-full sm:w-56" />
        </div>
      </div>

      {myRestaurants.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {myRestaurants.map((r) => (
            <button key={r.id} onClick={() => loadRestaurant(r.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedId === r.id ? "bg-gradient-primary text-white shadow-md" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"}`}>
              <Store className="w-4 h-4" /> {r.name}
            </button>
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white shadow-md">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{data.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{allItems.length} plat{allItems.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.address}</span>
                  {data.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.phone}</span>}
                  {data.deliveryZones?.length > 0 && <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {data.deliveryZones.length} zones</span>}
                  <span className="flex items-center gap-1 font-medium">Rayon: {data.deliveryRadius} km</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Livraisons en cours</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{deliveryList.length} active{deliveryList.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                {deliveryList.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">Aucune livraison active</p>
                ) : (
                  <div className="space-y-1.5">
                    {deliveryList.slice(0, 4).map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-[var(--muted)]">
                        <span className="font-medium">#{d.order?.orderNumber || d.orderId?.slice(0, 6)}</span>
                        <span className="text-[var(--muted-foreground)]">{d.deliveryPerson?.name || "En attente"}</span>
                        <Badge variant={d.status === "assigned" ? "warning" : d.status === "picked_up" ? "info" : "default"} size="sm">{d.status}</Badge>
                      </div>
                    ))}
                    {deliveryList.length > 4 && <p className="text-xs text-[var(--muted-foreground)]">+{deliveryList.length - 4} autres</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)] flex items-center justify-between">
                <span>{filtered.length} plat(s)</span>
                <span className="text-xs">Cliquer sur <Save className="w-3 h-3 inline" /> pour enregistrer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Plat</th>
                      <th className="p-4 font-semibold">Catégorie</th>
                      <th className="p-4 font-semibold">Prix</th>
                      <th className="p-4 font-semibold">Disponible</th>
                      <th className="p-4 font-semibold">Stock</th>
                      <th className="p-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const lowStock = stockValues[item.id] !== "" && parseInt(stockValues[item.id]) >= 0 && parseInt(stockValues[item.id]) <= 3;
                      return (
                        <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                              <div>
                                <span className={`font-medium ${item.isAvailable ? "" : "line-through text-[var(--muted-foreground)]"}`}>{item.name}</span>
                                {item.stock !== null && item.stock <= 3 && item.isAvailable && <Badge variant="warning" size="sm" className="ml-2"><AlertTriangle className="w-2.5 h-2.5" /> Stock: {item.stock}</Badge>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[var(--muted-foreground)]">{item.categoryName}</td>
                          <td className="p-4 font-semibold">{item.price.toLocaleString()} FCFA</td>
                          <td className="p-4">
                            <button onClick={() => handleToggle(item.id)} className={`p-2 rounded-lg transition-colors ${item.isAvailable ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-gray-300 bg-[var(--muted)]"}`}>
                              {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Input type="number" value={stockValues[item.id] ?? ""} onChange={(e) => setStockValues({ ...stockValues, [item.id]: e.target.value })} className="w-20 text-center" min="0" />
                              {lowStock && <AlertTriangle className="w-4 h-4 text-orange-400" title="Stock bas" />}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="ghost" onClick={() => handleStockSave(item.id)} disabled={saving}>
                              <Save className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
