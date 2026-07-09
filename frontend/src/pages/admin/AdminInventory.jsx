import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { restaurants, menuItems, deliveries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, ToggleLeft, ToggleRight, AlertTriangle, Store, MapPin, Phone, Map, Truck, Bike } from "lucide-react";

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

  useEffect(() => {
    loadMyRestaurants();
  }, []);

  async function loadMyRestaurants() {
    setLoading(true);
    try {
      const res = await restaurants.list({ mine: "true" });
      const list = res.restaurants || [];
      setMyRestaurants(list);
      if (list.length > 0) loadRestaurant(list[0].id);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStockSave(itemId) {
    const val = stockValues[itemId];
    const stock = val === "" || val === null ? null : parseInt(val, 10);
    if (stock !== null && isNaN(stock)) return toast("Stock invalide", "error");
    setSaving(true);
    try {
      await menuItems.update(itemId, { stock });
      toast("Stock mis à jour");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(itemId) {
    await menuItems.toggleAvailability(itemId);
    loadRestaurant(data.id);
  }

  if (loading && !data) return <div className="text-center py-12 text-[var(--muted-foreground)]">Chargement...</div>;
  if (myRestaurants.length === 0) return <div className="text-center py-12 text-[var(--muted-foreground)]">Aucun restaurant vous appartenant</div>;

  const allItems = data?.categories?.flatMap((cat) =>
    (cat.menuItems || []).map((item) => ({ ...item, categoryName: cat.name }))
  ) || [];

  const filtered = search
    ? allItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.categoryName?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Inventaire</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un plat..." className="pl-9 max-w-xs" />
        </div>
      </div>

      {myRestaurants.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {myRestaurants.map((r) => (
            <button key={r.id} onClick={() => loadRestaurant(r.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedId === r.id ? "bg-[#e67e22] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[#e67e22]/10"}`}>
              <Store className="w-4 h-4" /> {r.name}
            </button>
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.address}</span>
                  {data.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {data.phone}</span>}
                  {data.deliveryZones?.length > 0 && (
                    <span className="flex items-center gap-1"><Map className="w-4 h-4" /> {data.deliveryZones.join(", ")}</span>
                  )}
                  <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">Rayon: {data.deliveryRadius} km</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bike className="w-4 h-4 text-[#e67e22]" />
                  <span className="font-medium text-sm">Livraisons en cours</span>
                </div>
                {deliveryList.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">Aucune livraison active</p>
                ) : (
                  <div className="space-y-1">
                    {deliveryList.map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium">#{d.order?.orderNumber || d.orderId?.slice(0, 6)}</span>
                        <span className="text-[var(--muted-foreground)]">{d.deliveryPerson?.name || "En attente"}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${d.status === "assigned" ? "bg-yellow-100 text-yellow-700" : d.status === "picked_up" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                {filtered.length} plat(s) — Cliquer sur <Save className="w-3 h-3 inline" /> pour enregistrer le stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                      <th className="p-3 font-medium">Plat</th>
                      <th className="p-3 font-medium">Catégorie</th>
                      <th className="p-3 font-medium">Prix</th>
                      <th className="p-3 font-medium">Disponible</th>
                      <th className="p-3 font-medium">Stock</th>
                      <th className="p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const lowStock = stockValues[item.id] !== "" && parseInt(stockValues[item.id]) >= 0 && parseInt(stockValues[item.id]) <= 3;
                      return (
                        <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                              <span className={item.isAvailable ? "" : "line-through text-[var(--muted-foreground)]"}>{item.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--muted-foreground)]">{item.categoryName}</td>
                          <td className="p-3 font-medium">{item.price.toLocaleString()} FCFA</td>
                          <td className="p-3">
                            <button onClick={() => handleToggle(item.id)} className={item.isAvailable ? "text-[#2ecc71]" : "text-gray-300"}>
                              {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={stockValues[item.id] ?? ""}
                                onChange={(e) => setStockValues({ ...stockValues, [item.id]: e.target.value })}
                                className="w-20 text-center"
                                min="0"
                              />
                              {lowStock && <AlertTriangle className="w-4 h-4 text-orange-400" title="Stock bas" />}
                            </div>
                          </td>
                          <td className="p-3">
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
