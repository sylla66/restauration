import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, Truck, Star, Clock, ArrowRight, ChefHat, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { restaurants } from "@/services/api";

const features = [
  { icon: ChefHat, title: "Cuisine Sénégalaise", desc: "Thiébou Dieune, Yassa, Mafé et bien plus", gradient: "from-orange-500 to-amber-600" },
  { icon: Truck, title: "Livraison Rapide", desc: "Livré chez vous en un rien de temps", gradient: "from-emerald-500 to-teal-600" },
  { icon: Star, title: "Produits Frais", desc: "Ingrédients locaux de qualité", gradient: "from-purple-500 to-pink-600" },
  { icon: Clock, title: "Commande Flexible", desc: "Sur place, à emporter ou livré", gradient: "from-blue-500 to-cyan-600" },
];

export default function Home() {
  const [restoList, setRestoList] = useState([]);

  useEffect(() => {
    restaurants.list().then((res) => setRestoList(res.restaurants || [])).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#1a0e00] dark:via-[#0a0a1a] dark:to-[#1a0e00] border border-[var(--border)] p-8 md:p-12 lg:p-16 mb-8">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--secondary)]/5 rounded-full blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold mb-4">
            <MapPin className="w-3 h-3" /> Dakar, Sénégal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] mb-4 leading-tight">
            Bienvenue chez <span className="bg-gradient-to-r from-[var(--primary)] to-orange-500 bg-clip-text text-transparent">Dakar Gourmet</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-8 max-w-2xl">
            Découvrez les saveurs authentiques du Sénégal, commandez en ligne et dégustez chez vous en toute simplicité.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/menu">
              <Button size="lg" className="gap-2 shadow-lg">
                Voir le menu <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </section>

      {restoList.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Nos restaurants</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {restoList.map((r, i) => (
              <Link key={r.id} to={`/menu?restaurant=${r.id}`} className="group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{r.name}</h3>
                      {r.address && <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {r.address}</p>}
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                  {r.deliveryZones?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.deliveryZones.slice(0, 3).map((z) => (
                        <span key={z} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">{z}</span>
                      ))}
                      {r.deliveryZones.length > 3 && <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">+{r.deliveryZones.length - 3}</span>}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <div key={f.title} className="group animate-fade-in relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-200", f.gradient)}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--foreground)] mb-1.5">{f.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function cn(...args) {
  return args.filter(Boolean).join(" ");
}
